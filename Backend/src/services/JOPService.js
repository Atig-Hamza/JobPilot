import { generateText } from './LLMService.js'

const processSearchWithAI = async function* ({ keywords, country, limit }) {
    const runId = crypto.randomUUID()
    const results = []
    const visitedDomains = new Set()
    const usedQueries = new Set()
    const countryName = getCountryName(country)
    let phase = 0
    let entropy = Math.random().toString(36).slice(2)

    yield { type: 'process', content: `Initializing autonomous intelligence run ${runId.slice(0, 8)} for "${keywords}" in ${countryName}...` }

    while (results.length < limit && phase < 7) {
        phase++

        const queries = await generateQueries({
            keywords,
            countryName,
            runId,
            entropy,
            phase,
            context: results.map(r => r.company).join(', ')
        })

        for (const query of shuffle(queries)) {
            if (results.length >= limit) break
            if (usedQueries.has(query)) continue
            usedQueries.add(query)

            yield { type: 'process', content: `Exploring search vector: ${query}` }

            const urls = await performWebSearch(query, limit * 6)

            for (const url of shuffle(urls)) {
                if (results.length >= limit) break

                let domain
                try { domain = new URL(url).hostname.replace(/^www\./, '') } catch { continue }
                if (visitedDomains.has(domain)) continue
                visitedDomains.add(domain)

                const html = await fetchWithTimeout(url, 12000)
                if (!html) continue

                const score = await scoreDomain(domain, html, runId, entropy)
                if (score < 0.58) continue

                yield { type: 'process', content: `Inspecting domain ${domain} (${Math.round(score * 100)}% confidence)` }

                const company = await processSingleCompany(url, score < 0.78, runId, entropy)
                if (!company) continue

                results.push(company)
                yield { type: 'json', data: company }
                yield { type: 'process', content: `Validated company: ${company.company}` }
            }
        }

        entropy = Math.random().toString(36).slice(2)
    }

    if (results.length) {
        let summary = ''
        try {
            summary = await generateText(
                `RunID:${runId}
Entropy:${entropy}
Summarize market insight in max 50 words.
Sector:${keywords}
Country:${countryName}
Companies:${results.map(r => r.company).join(', ')}`,
                `sum-${Date.now()}-${entropy}`,
                () => { },
                "You are a strategic market analyst."
            )
        } catch {
            summary = 'Verified companies with active operational presence were identified in this sector.'
        }

        yield { type: 'markdown', content: generateMarkdownTable(results, summary) }
        yield { type: 'complete', data: results }
    } else {
        yield { type: 'markdown', content: `**Result**: No verified companies detected. Expand or rephrase keywords.` }
    }
}

const generateQueries = async ({ keywords, countryName, runId, entropy, phase, context }) => {
    try {
        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}
Phase:${phase}

Goal: discover real operating companies.
Keywords:${keywords}
Country:${countryName}
Context:${context || 'none'}

Generate 6 NEW business-focused search queries.
Each must explore a different angle.
Never repeat previous structure.
Avoid generic phrasing.

Return JSON array only.
`,
            `q-${Date.now()}-${entropy}`,
            () => { },
            "You generate adaptive search strategies."
        )
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
        return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
        return [
            `${keywords} business ${countryName} ${entropy}`,
            `${keywords} services firm ${countryName}`,
            `enterprise ${keywords} providers ${countryName}`,
            `${keywords} solution company ${countryName}`,
            `professional ${keywords} agency ${countryName}`,
            `${keywords} commercial operations ${countryName}`
        ]
    }
}

const scoreDomain = async (domain, html, runId, entropy) => {
    try {
        const r = await generateText(
            `
RunID:${runId}
Entropy:${entropy}
Evaluate if this domain is a real operating company.
Return only a number between 0 and 1.

Domain:${domain}
HTML:${html.slice(0, 1800)}
`,
            `score-${Date.now()}-${entropy}`,
            () => { },
            "You evaluate website legitimacy."
        )
        const n = parseFloat(r)
        return isNaN(n) ? 0.35 : Math.min(Math.max(n, 0), 1)
    } catch {
        return 0.4
    }
}

const generateMarkdownTable = (results, summary) => {
    let md = `\n### 🌍 Market Intelligence Report\n\n`
    if (summary) md += `> *${summary.trim()}*\n\n`

    md += `| Company | Domain | Contact | Role | Description |\n`
    md += `| :--- | :--- | :--- | :--- | :--- |\n`

    results.forEach(r => {
        const best = r.emails.sort((a, b) => b.confidence - a.confidence)[0]
        const email = best ? `**${best.address}**` : 'N/A'
        const role = best ? `**${best.category.toUpperCase()}**` : '-'
        const icon = r.favicon ? `<img src="${r.favicon}" width="16" height="16" style="vertical-align:middle;margin-right:6px;border-radius:4px;" />` : ''
        const desc = r.description || 'Operational company active in this market'
        md += `| ${icon}**${r.company}** | [${r.domain}](https://${r.domain}) | ${email} | ${role} | ${desc} |\n`
    })

    return md
}

const processSingleCompany = async (url, relaxed, runId, entropy) => {
    try {
        const html = await fetchWithTimeout(url, 10000)
        if (!html) return null

        const domain = new URL(url).hostname.replace(/^www\./, '')
        let name = getMetaContent(html, 'og:site_name') || getTitleTag(html) || domain.split('.')[0].toUpperCase()
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        const emails = extractEmails(html)

        const description = await generateCompanyDescription(name, domain, html, runId, entropy)

        if (!emails.length && relaxed) {
            return {
                company: name.trim(),
                domain,
                favicon,
                emails: [{ address: 'Contact via Website', category: 'General', confidence: 0.5 }],
                description,
                source: 'Broad Recovery'
            }
        }

        if (!emails.length) return null
        const classified = await classifyEmails(emails, domain, runId, entropy)
        if (!classified.length) return null

        return {
            company: name.trim(),
            domain,
            favicon,
            emails: classified,
            description,
            source: relaxed ? 'Broad Recovery' : 'Deep Scan'
        }
    } catch {
        return null
    }
}

const generateCompanyDescription = async (name, domain, html, runId, entropy) => {
    try {
        const r = await generateText(
            `
RunID:${runId}
Entropy:${entropy}

Company:${name}
Domain:${domain}

Write a concise factual business description (max 18 words).
Avoid marketing language.

HTML:${html.slice(0, 1500)}
`,
            `desc-${Date.now()}-${entropy}`,
            () => { },
            "You summarize company activities."
        )
        return r.replace(/\.$/, '').trim()
    } catch {
        return 'Active company operating within this industry'
    }
}

const performWebSearch = async (query, limit) => {
    try {
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=wt-wt`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const html = await res.text()
        const urls = []
        const rx = /<a[^>]+class="result__a"[^>]+href="([^"]+)"/g
        let m
        while ((m = rx.exec(html)) !== null && urls.length < limit) {
            let u = m[1]
            if (u.includes('uddg=')) {
                try { u = decodeURIComponent(new URLSearchParams(u.split('?')[1]).get('uddg')) } catch { }
            }
            if (isValidUrl(u) && !isBlocklisted(u)) urls.push(u)
        }
        return urls
    } catch {
        return []
    }
}

const fetchWithTimeout = async (url, ms) => {
    try {
        const c = new AbortController()
        setTimeout(() => c.abort(), ms)
        const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'JobPilot-Agent/6.0' } })
        return r.ok ? await r.text() : null
    } catch {
        return null
    }
}

const extractEmails = t => {
    const m = [...t.matchAll(/href="mailto:([^"?]+)"/g)].map(x => x[1])
    const r = [...new Set([...(t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []), ...m])]
    return r.filter(e => e.length < 40 && !/noreply|example|wix|sentry/i.test(e))
}

const classifyEmails = async (emails, domain, runId, entropy) => {
    try {
        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}

Classify business emails for ${domain}.
Return JSON [{address,category,confidence}].

Emails:${JSON.stringify(emails)}
`,
            `cls-${Date.now()}-${entropy}`,
            () => { },
            "You classify emails."
        )
        const p = JSON.parse(raw.replace(/```json|```/g, '').trim())
        return Array.isArray(p) ? p : []
    } catch {
        return emails.map(e => ({ address: e, category: heuristicRole(e), confidence: 0.7 }))
    }
}

const heuristicRole = e => /hr|career/i.test(e) ? 'HR' : /sales|marketing/i.test(e) ? 'Sales' : /support|help/i.test(e) ? 'Support' : 'Info'
const shuffle = a => a.sort(() => Math.random() - 0.5)
const isValidUrl = u => { try { new URL(u); return true } catch { return false } }
const isBlocklisted = u => ['facebook', 'linkedin', 'twitter', 'instagram', 'youtube', 'clutch', 'g2', 'zoominfo'].some(b => u.includes(b))
const getCountryName = c => ({ us: 'United States', gb: 'United Kingdom', ca: 'Canada', de: 'Germany', fr: 'France', au: 'Australia', es: 'Spain', it: 'Italy', nl: 'Netherlands', br: 'Brazil', in: 'India', jp: 'Japan', cn: 'China', ma: 'Morocco' }[c?.toLowerCase()] || 'Global')
const getMetaContent = (h, p) => (h.match(new RegExp(`<meta property="${p}" content="([^"]+)"`, 'i')) || [])[1] || null
const getTitleTag = h => (h.match(/<title>(.*?)<\/title>/i) || [])[1]?.split(/[|-]/)[0]?.trim() || null

export {
    processSearchWithAI,
    performWebSearch,
    processSingleCompany,
    classifyEmails
}
