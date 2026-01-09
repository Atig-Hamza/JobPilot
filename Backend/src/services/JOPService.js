import { generateText } from './LLMService.js';

const processSearchWithAI = async function* ({ keywords, country, limit }) {
    const allResults = [];
    const seenUrls = new Set();
    const tld = getCountryTld(country);
    const countryName = getCountryName(country);

    yield { type: 'process', content: `**Agent Status**: Analyzing intent and generating targeted search strategies for "${keywords}" in ${countryName}...` };

    let searchQueries = [];
    try {
        const queryPrompt = `
        You are a search expert.
        User wants to find OFFICIAL COMPANY WEBSITES for: "${keywords}" in "${countryName}".
        Generate 5 specific Google/DuckDuckGo search queries.
        Rules:
        - Do NOT use negative keywords like -jobs or -careers as valid companies have them.
        - Exclude "Top 10" lists or generic blog posts.
        - Prioritize "contact us" or "about us" pages.
        - Use country-specific TLD syntax (site:.${tld}) where helpful.
        Format: Return ONLY a valid JSON array of strings. Example: ["query 1", "query 2"]
        `;
        
        const generatedQueries = await generateText(queryPrompt, `qgen-${Date.now()}`, () => {}, "You are a search query generator.");
        searchQueries = JSON.parse(generatedQueries.replace(/```json|```/g, '').trim());
        
        if (!Array.isArray(searchQueries)) throw new Error("Invalid format");
    } catch (e) {
        searchQueries = [
             `${keywords} companies in ${countryName} official website`,
             `site:.${tld} ${keywords} "contact us"`,
             `${keywords} service providers ${countryName}`,
             `${keywords} business directory ${countryName}`
        ];
    }

    try {
        for (const query of searchQueries) {
            if (allResults.length >= limit) break;

            yield { type: 'process', content: `**Action**: Executing search vector: *${query}*...` };
            
            const candidateUrls = await performWebSearch(query, limit * 4);
            const targets = candidateUrls
                .filter(u => !seenUrls.has(u))
                .filter(u => !u.includes('/blog') && !u.includes('/news') && !u.includes('article') && !u.includes('guide'))
                .sort(() => Math.random() - 0.5)
                .slice(0, limit * 2);

            for (const url of targets) {
                if (allResults.length >= limit) break;
                
                const hostname = new URL(url).hostname;
                if (seenUrls.has(hostname)) continue;
                seenUrls.add(hostname);

                yield { type: 'process', content: `**Analysis**: Inspecting [${hostname}](${url})...` };
                
                const companyData = await processSingleCompany(url, false);
                
                if (companyData) {
                    allResults.push(companyData);
                    yield { type: 'json', data: companyData };
                    yield { type: 'process', content: `**Success**: Verified intelligence for **${companyData.company}**` };
                }
            }
        }

        if (allResults.length === 0) {
            yield { type: 'process', content: `**Result**: Strict scan yielded low confidence. Initiating **Broad Spectrum Recovery**...` };
            
            const fallbackQuery = `${keywords} companies ${countryName}`;
            const fallbackUrls = await performWebSearch(fallbackQuery, 10);
            
            for (const url of fallbackUrls) {
                if (allResults.length >= limit) break;
                if (seenUrls.has(new URL(url).hostname)) continue;
                
                yield { type: 'process', content: `**Action**: Broad scan inspecting [${new URL(url).hostname}]...` };
                const companyData = await processSingleCompany(url, true);
                
                if (companyData) {
                    allResults.push(companyData);
                    yield { type: 'json', data: companyData };
                    yield { type: 'process', content: `**Success**: Recovered contact for **${companyData.company}**` };
                }
            }
        } else {
            yield { type: 'process', content: `**Status**: Scan complete. Synthesizing intelligence report...` };
            
            const companiesList = allResults.map(c => `${c.company} (${c.domain}) - ${c.emails[0]?.category}`).join(', ');
            const summaryReqId = `sum-${Date.now()}`;
            
            let summary = "";
            try {
                summary = await generateText(
                    `Write a compact, professional executive summary (max 50 words) about these discovered companies in the ${keywords} sector in ${countryName}: ${companiesList}. Focus on the market presence found.`, 
                    summaryReqId, 
                    () => {}, 
                    "You are a market intelligence analyst."
                );
            } catch (e) {
                summary = "Analysis suggests a diverse range of active entities in this sector.";
            }

            const tableMd = generateMarkdownTable(allResults, summary);
            yield { type: 'markdown', content: tableMd };
        }

        if (allResults.length > 0) {
           yield { type: 'complete', data: allResults };
        } else {
            yield { type: 'markdown', content: `**Result**: No verified contacts found. Try broadening your keywords (e.g. use "Software" instead of "Java").` };
        }

    } catch (error) {
        console.error(error);
        yield { type: 'markdown', content: `**Error**: System execution failure - ${error.message}` };
    }
};

const generateMarkdownTable = (results, summary) => {
    let md = `\n### 🌍 Market Intelligence Report\n\n`;
    
    if (summary) {
        md += `> *${summary.trim()}*\n\n`;
    }

    md += `| Company | Domain | Contact | Role | Source |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    
    results.forEach(r => {
        const bestEmail = r.emails.sort((a,b) => b.confidence - a.confidence)[0];
        const emailStr = bestEmail ? `**${bestEmail.address}**` : 'N/A';
        const role = bestEmail ? `**${bestEmail.category.toUpperCase()}**` : '-';
        const favicon = r.favicon ? `<img src="${r.favicon}" width="16" height="16" style="display:inline-block; vertical-align:middle; margin-right:8px; border-radius:4px;" />` : ''; 
        
        md += `| ${favicon}**${r.company}** | [${r.domain}](https://${r.domain}) | ${emailStr} | ${role} | ${r.source} |\n`;
    });
    
    return md;
};

const performWebSearch = async (query, limit) => {
    try {
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=wt-wt`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        
        const text = await response.text();
        const linkRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"/g;
        const matches = [];
        let match;
        
        while ((match = linkRegex.exec(text)) !== null) {
            let url = match[1];
            if (url.includes('uddg=')) {
                try { url = decodeURIComponent(new URLSearchParams(url.split('?')[1]).get('uddg')); } catch (e) {}
            }
            if (isValidUrl(url) && !isBlocklisted(url)) matches.push(url);
        }
        
        return matches;
    } catch (error) {
        return [];
    }
};

const processSingleCompany = async (url, relaxedMode = false) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'JobPilot-Agent/3.0' }
        });
        clearTimeout(timeout);

        if (!response.ok) return null;
        let html = await response.text();
        
        let title = getMetaContent(html, 'og:site_name') || getTitleTag(html);
        const domain = new URL(url).hostname.replace(/^www\./, '');
        if (!title || title.length < 2) title = domain.split('.')[0].toUpperCase();

        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`; 

        let validEmails = extractEmails(html);

        if (validEmails.length === 0) {
            const contactLinkRegex = /<a[^>]+href="([^"]*contact[^"]*|[^"]*about[^"]*|[^"]*reach[^"]*)"[^>]*>| <a[^>]+href="([^"]+)"[^>]*>(?:.*contact.*|.*about.*|.*reach.*)<\/a>/i;
            const contactLinkMatch = html.match(contactLinkRegex);
            
            if (contactLinkMatch) {
                let contactUrl = contactLinkMatch[1] || contactLinkMatch[2];
                if (contactUrl && !contactUrl.startsWith('mailto:')) {
                    if (!contactUrl.startsWith('http')) {
                        if (contactUrl.startsWith('/')) {
                            contactUrl = new URL(url).origin + contactUrl;
                        } else {
                            contactUrl = new URL(url).origin + '/' + contactUrl;
                        }
                    }

                    try {
                        const subController = new AbortController();
                        const subTimeout = setTimeout(() => subController.abort(), 8000);
                        const subRes = await fetch(contactUrl, { 
                            signal: subController.signal,
                            headers: { 'User-Agent': 'JobPilot-Agent/3.0' } 
                        });
                        clearTimeout(subTimeout);
                        if (subRes.ok) {
                            const subHtml = await subRes.text();
                            const subEmails = extractEmails(subHtml);
                            validEmails = [...validEmails, ...subEmails];
                        }
                    } catch(e) {
                         // Ignore sub-page fetch errors
                    }
                }
            }
        }

        validEmails = [...new Set(validEmails)];

        if (relaxedMode && validEmails.length > 0) {
             const simpleEmails = validEmails.map(e => ({
                address: e,
                category: heuristicRole(e),
                confidence: 0.6
             }));
             return {
                company: title.trim(),
                domain: domain,
                favicon: favicon,
                emails: simpleEmails,
                source: "Broad Recovery"
             };
        }

        if (validEmails.length === 0) return null;

        const classifiedEmails = await classifyEmails(validEmails, domain);
        if (!classifiedEmails.length) return null;

        return {
            company: title.trim(),
            domain: domain,
            favicon: favicon,
            emails: classifiedEmails,
            source: "Deep Scan"
        };
    } catch (error) {
        return null;
    }
};

const extractEmails = (text) => {
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
    const rawEmails = [...new Set(text.match(emailRegex) || [])];
    
    return rawEmails.filter(e => 
        !/\.(png|jpg|css|js|svg|gif|webp)$/i.test(e) && 
        !/sentry|noreply|domain\.com|email\.com|example|wixpress|sentry/.test(e) &&
        e.length < 40
    );
};

const classifyEmails = async (emails, domain) => {
    try {
        const prompt = `Classify business emails for ${domain} into categories (info, hr, sales, support, management). Input: ${JSON.stringify(emails)}. Return JSON Array [{address, category, confidence}].`;
        const jsonStr = await generateText(prompt, `cls-${Date.now()}`, () => {}, "You are a JSON data classifier.");
        const parsed = JSON.parse(jsonStr.replace(/```json|```/g, '').trim());
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return emails.slice(0, 3).map(e => ({
            address: e,
            category: heuristicRole(e),
            confidence: 0.7
        }));
    }
};

const heuristicRole = (e) => {
    if (/hr|job|career/i.test(e)) return 'HR';
    if (/sales|marketing/i.test(e)) return 'Sales';
    if (/support|help/i.test(e)) return 'Support';
    return 'Info';
};

const isBlocklisted = (url) => {
    const block = [
        'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'google.com', 
        'clutch.co', 'goodfirms.co', 'upwork.com', 'indeed.com', 'yelp.com', 'zoominfo.com', 'g2.com'
    ];
    return block.some(b => url.includes(b));
};

const isValidUrl = (s) => {
    try { new URL(s); return true; } catch (e) { return false; }
};

const getCountryTld = (code) => {
    const tlds = {
        'us': 'com', 'gb': 'co.uk', 'ca': 'ca', 'de': 'de', 'fr': 'fr',
        'au': 'com.au', 'ma': 'ma', 'es': 'es', 'it': 'it', 'nl': 'nl',
        'br': 'com.br', 'in': 'co.in', 'jp': 'co.jp', 'cn': 'cn'
    };
    return tlds[code?.toLowerCase()] || 'com';
};

const getCountryName = (code) => {
    const names = {
        'us': 'United States', 'gb': 'United Kingdom', 'ca': 'Canada', 'de': 'Germany',
        'fr': 'France', 'au': 'Australia', 'ma': 'Morocco', 'es': 'Spain',
        'it': 'Italy', 'nl': 'Netherlands', 'br': 'Brazil', 'in': 'India',
        'jp': 'Japan', 'cn': 'China', 'all': 'Global'
    };
    return names[code?.toLowerCase()] || code || 'Global';
};

const getMetaContent = (html, prop) => {
    const m = html.match(new RegExp(`<meta property="${prop}" content="([^"]+)"`, 'i'));
    return m ? m[1] : null;
};

const getTitleTag = (html) => {
    const m = html.match(/<title>(.*?)<\/title>/i);
    return m ? m[1].split(/[|-]/)[0].trim() : null;
};

export {
    processSearchWithAI,
    performWebSearch,
    processSingleCompany,
    classifyEmails
};
