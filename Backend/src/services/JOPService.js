import { generateText } from './LLMService.js'

const processSearchWithAI = async function* ({ keywords, country, limit, includeRecruiterEmails }) {
    const runId = crypto.randomUUID()
    const results = []
    const visitedUrls = new Set()
    const usedQueries = new Set()
    const countryName = getCountryName(country)
    const isGlobal = !country || country.toLowerCase() === 'global'
    let phase = 0
    let entropy = Math.random().toString(36).slice(2)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' })

    const scopeLabel = isGlobal ? 'Global' : countryName
    const deadline = Date.now() + 55000
    const isTimedOut = () => Date.now() > deadline
    yield { type: 'process', content: `Initializing web intelligence run ${runId.slice(0, 8)} for "${keywords}" — scope: ${scopeLabel}${includeRecruiterEmails ? ' (+ recruiter hunting)' : ''}...` }

    const recencyIntent = await detectRecencyIntent(keywords, currentYear, currentMonth, runId, entropy)
    if (recencyIntent.isRecent) {
        yield { type: 'process', content: `Detected recency intent: prioritizing results from ${recencyIntent.timeframe}` }
    }

    const emailHuntingMode = detectEmailHuntingIntent(keywords, includeRecruiterEmails)
    if (emailHuntingMode.isEmailFocused) {
        yield { type: 'process', content: `🎯 Email hunting mode activated: ${emailHuntingMode.strategy}` }
    }

    while (results.length < limit && phase < 4 && !isTimedOut()) {
        phase++

        const queries = await generateSearchQueries({
            keywords,
            countryName,
            isGlobal,
            includeRecruiterEmails,
            runId,
            entropy,
            phase,
            foundSoFar: results.map(r => r.title || r.domain).join(', '),
            recencyIntent,
            currentYear,
            currentMonth,
            emailHuntingMode
        })

        for (const query of shuffle(queries)) {
            if (results.length >= limit || isTimedOut()) break
            if (usedQueries.has(query)) continue
            usedQueries.add(query)

            yield { type: 'process', content: `Searching: ${query}` }

            const urls = await performGlobalSearch(query, limit * 3, isGlobal ? null : country)

            let enrichedUrls = [...urls]
            if (emailHuntingMode.isEmailFocused && phase <= 3 && !isTimedOut()) {
                const linkedInUrls = await searchLinkedInProfiles(keywords, countryName, isGlobal, limit * 2)
                const emailDbUrls = await searchEmailDatabases(keywords, countryName, limit)
                enrichedUrls = deduplicateUrls([...urls, ...linkedInUrls, ...emailDbUrls])
                if (linkedInUrls.length) yield { type: 'process', content: `Found ${linkedInUrls.length} LinkedIn profile leads` }
                if (emailDbUrls.length) yield { type: 'process', content: `Found ${emailDbUrls.length} email database leads` }
            }

            for (const url of shuffle(enrichedUrls)) {
                if (results.length >= limit || isTimedOut()) break
                if (visitedUrls.has(url)) continue

                let domain
                try { domain = new URL(url).hostname.replace(/^www\./, '') } catch { continue }
                visitedUrls.add(url)

                const isLinkedIn = domain.includes('linkedin.com')
                if (isLinkedIn) {
                    const linkedInResult = await processLinkedInUrl(url, keywords, runId, entropy, emailHuntingMode)
                    if (linkedInResult) {
                        results.push(linkedInResult)
                        yield { type: 'json', data: linkedInResult }
                        yield { type: 'process', content: `Found LinkedIn lead: ${linkedInResult.title} ${linkedInResult.emails?.length ? `(${linkedInResult.emails.length} email${linkedInResult.emails.length > 1 ? 's' : ''})` : ''}` }
                    }
                    continue
                }

                const html = await fetchWithTimeout(url, 7000)
                if (!html) continue

                const relevance = scoreRelevanceFast(domain, url, html, keywords, recencyIntent, currentYear)
                if (relevance < 0.3) continue

                yield { type: 'process', content: `Analyzing ${domain} (${Math.round(relevance * 100)}% relevance)` }

                const result = await processWebResult(url, html, keywords, runId, entropy, includeRecruiterEmails, currentYear)
                if (!result) continue

                if (recencyIntent.isRecent && result.publishDate) {
                    const resultYear = extractYearFromDate(result.publishDate)
                    if (resultYear && resultYear < recencyIntent.minYear) {
                        yield { type: 'process', content: `Skipping ${domain} — content from ${resultYear}, too old for this query` }
                        continue
                    }
                }

                if (includeRecruiterEmails && result.resultType === 'company') {
                    if (!result.recruiterEmails || result.recruiterEmails.length === 0) {
                        yield { type: 'process', content: `Deep hunting recruiter contacts at ${result.domain}...` }
                        result.recruiterEmails = await deepRecruiterHunt(result.domain, result.title, runId, entropy)
                    }
                    if (result.recruiterEmails.length > 0) {
                        result.recruiterEmails = await verifyAndRankRecruiterEmails(result.recruiterEmails, result.domain, runId, entropy)
                    }
                }

                if (emailHuntingMode.isEmailFocused) {
                    yield { type: 'process', content: `🔍 Deep email discovery on ${result.domain}...` }
                    const advancedEmails = await advancedEmailDiscovery(result.domain, result.title, html, runId, entropy)
                    if (advancedEmails.length) {
                        const existingAddresses = new Set([
                            ...(result.emails || []).map(e => e.address.toLowerCase()),
                            ...(result.recruiterEmails || []).map(e => e.address.toLowerCase())
                        ])
                        for (const ae of advancedEmails) {
                            if (!existingAddresses.has(ae.address.toLowerCase())) {
                                if (ae.isRecruiter) {
                                    result.recruiterEmails = result.recruiterEmails || []
                                    result.recruiterEmails.push(ae)
                                } else {
                                    result.emails = result.emails || []
                                    result.emails.push(ae)
                                }
                                existingAddresses.add(ae.address.toLowerCase())
                            }
                        }
                        yield { type: 'process', content: `Discovered ${advancedEmails.length} additional email(s) via advanced techniques` }
                    }
                }

                results.push(result)
                yield { type: 'json', data: result }

                const recruiterNote = result.recruiterEmails?.length
                    ? ` (${result.recruiterEmails.length} recruiter contact${result.recruiterEmails.length > 1 ? 's' : ''})`
                    : ''
                const emailNote = result.emails?.length
                    ? ` (${result.emails.length} email${result.emails.length > 1 ? 's' : ''})`
                    : ''
                yield { type: 'process', content: `Found: ${result.title || result.domain}${recruiterNote}${emailNote}` }
            }
        }

        if (emailHuntingMode.isEmailFocused && results.length > 0 && results.length < limit && phase <= 2 && !isTimedOut()) {
            yield { type: 'process', content: `🔄 Cross-referencing discovered domains for additional contacts...` }
            for (const r of results) {
                if (results.length >= limit || isTimedOut()) break
                if (!r.domain) continue
                const crossRefEmails = await crossReferenceEmailSources(r.domain, r.title, runId, entropy)
                if (crossRefEmails.length) {
                    const existingAddresses = new Set([
                        ...(r.emails || []).map(e => e.address.toLowerCase()),
                        ...(r.recruiterEmails || []).map(e => e.address.toLowerCase())
                    ])
                    let added = 0
                    for (const ce of crossRefEmails) {
                        if (!existingAddresses.has(ce.address.toLowerCase())) {
                            if (ce.isRecruiter) {
                                r.recruiterEmails = r.recruiterEmails || []
                                r.recruiterEmails.push(ce)
                            } else {
                                r.emails = r.emails || []
                                r.emails.push(ce)
                            }
                            existingAddresses.add(ce.address.toLowerCase())
                            added++
                        }
                    }
                    if (added) {
                        yield { type: 'process', content: `Cross-ref found ${added} new contact(s) for ${r.domain}` }
                        yield { type: 'json', data: r }
                    }
                }
            }
        }

        entropy = Math.random().toString(36).slice(2)
    }

    if (results.length) {
        const formatDecision = await decideOutputFormat(results, keywords, includeRecruiterEmails, runId, entropy, emailHuntingMode)

        let summary = ''
        try {
            summary = await generateText(
                `RunID:${runId}
Entropy:${entropy}
Today's date: ${currentMonth} ${currentDate.getDate()}, ${currentYear}
Summarize your findings in max 60 words.
Query: ${keywords}
Scope: ${scopeLabel}
Results found: ${results.length}
Types: ${[...new Set(results.map(r => r.resultType))].join(', ')}
Total emails found: ${results.reduce((sum, r) => sum + (r.emails?.length || 0) + (r.recruiterEmails?.length || 0), 0)}
Titles: ${results.map(r => r.title).join(', ')}`,
                `sum-${Date.now()}-${entropy}`,
                () => { },
                "You are a research analyst summarizing web intelligence findings. Always reference the most current information available."
            )
        } catch {
            summary = 'Relevant results were identified and analyzed from multiple web sources.'
        }

        const report = await generateReport(results, summary, includeRecruiterEmails, keywords, formatDecision, runId, entropy, currentYear, emailHuntingMode)
        yield { type: 'markdown', content: report }
        yield { type: 'complete', data: results }
    } else {
        yield { type: 'markdown', content: `**Result**: No relevant results found. Try broader or different keywords.` }
    }
}

// ─── Email Hunting Intent Detection ─────────────────────────────────────────

const detectEmailHuntingIntent = (keywords, includeRecruiterEmails) => {
    const kw = keywords.toLowerCase()

    const emailPatterns = /\b(email|e-mail|mail|contact|recruiter|recruiter email|hr email|hiring manager|talent acquisition|staffing|headhunter|recruitment|find email|get email|email address|reach out|contact info|who to contact|hiring contact|hr contact|recruiter contact|people team)\b/i
    const linkedInPatterns = /\b(linkedin|linked in|profile|recruiter profile|hr profile|hiring manager profile)\b/i
    const companyHiringPatterns = /\b(who is hiring|hiring at|careers at|jobs at|work at|join.*team|apply to|recruiter at|hr at|talent at)\b/i

    const isEmailFocused = emailPatterns.test(kw) || linkedInPatterns.test(kw) || companyHiringPatterns.test(kw) || includeRecruiterEmails
    const wantsLinkedIn = linkedInPatterns.test(kw) || /recruiter|hiring manager|talent|hr manager|head of hr/i.test(kw)
    const wantsCompanyEmails = companyHiringPatterns.test(kw) || emailPatterns.test(kw)

    let strategy = 'standard'
    if (isEmailFocused) {
        if (wantsLinkedIn && wantsCompanyEmails) strategy = 'full-spectrum'
        else if (wantsLinkedIn) strategy = 'linkedin-focused'
        else if (wantsCompanyEmails) strategy = 'company-email-focused'
        else strategy = 'general-email-discovery'
    }

    return {
        isEmailFocused,
        wantsLinkedIn,
        wantsCompanyEmails,
        strategy
    }
}

// ─── LinkedIn Profile Search (Public Data Only) ─────────────────────────────

const searchLinkedInProfiles = async (keywords, countryName, isGlobal, limit) => {
    const queries = [
        `site:linkedin.com/in/ ${keywords} ${isGlobal ? '' : countryName} recruiter OR "talent acquisition" OR "hiring manager" OR HR`,
        `site:linkedin.com/company/ ${keywords} ${isGlobal ? '' : countryName}`,
    ]

    const allUrls = []
    for (const query of queries) {
        try {
            const urls = await performWebSearch(query.trim(), Math.ceil(limit / 2))
            allUrls.push(...urls)
        } catch { }
    }

    return [...new Set(allUrls)].filter(u => u.includes('linkedin.com')).slice(0, limit)
}

// ─── LinkedIn URL Processing ────────────────────────────────────────────────

const processLinkedInUrl = async (url, keywords, runId, entropy, emailHuntingMode) => {
    try {
        const html = await fetchWithTimeout(url, 8000)
        if (!html) return null

        const domain = new URL(url).hostname.replace(/^www\./, '')
        const isProfile = url.includes('/in/')
        const isCompany = url.includes('/company/')

        const title = getMetaContent(html, 'og:title') || getTitleTag(html) || 'LinkedIn Profile'
        const description = getMetaContent(html, 'og:description') || getMetaContent(html, 'description') || ''
        const ogImage = getMetaContent(html, 'og:image') || ''

        const profileData = extractLinkedInPublicData(html, url)

        let discoveredEmails = []
        if (profileData.companyDomain && emailHuntingMode.isEmailFocused) {
            discoveredEmails = await deriveEmailsFromProfile(profileData, runId, entropy)
        }

        const pageEmails = extractEmails(html)
        for (const pe of pageEmails) {
            if (!discoveredEmails.some(de => de.address.toLowerCase() === pe.toLowerCase())) {
                discoveredEmails.push({
                    address: pe,
                    category: heuristicRole(pe),
                    confidence: 0.7,
                    source: 'linkedin-page-direct'
                })
            }
        }

        return {
            title: title.trim(),
            domain: profileData.companyDomain || domain,
            url,
            favicon: `https://www.google.com/s2/favicons?domain=linkedin.com&sz=64`,
            siteName: 'LinkedIn',
            ogImage,
            resultType: isCompany ? 'company' : 'person',
            description: description.slice(0, 200) || profileData.headline || 'LinkedIn profile',
            keyInsights: profileData.insights || [],
            publishDate: null,
            emails: discoveredEmails.filter(e => !e.isRecruiter),
            recruiterEmails: discoveredEmails.filter(e => e.isRecruiter),
            linkedInData: profileData,
            source: 'LinkedIn Intelligence'
        }
    } catch {
        return null
    }
}

const extractLinkedInPublicData = (html, url) => {
    const data = {
        name: null,
        headline: null,
        company: null,
        companyDomain: null,
        location: null,
        insights: [],
        profileType: url.includes('/in/') ? 'person' : url.includes('/company/') ? 'company' : 'other'
    }

    const ogTitle = getMetaContent(html, 'og:title') || ''
    const ogDesc = getMetaContent(html, 'og:description') || ''

    if (data.profileType === 'person') {
        const nameParts = ogTitle.split(/\s*[-–|]\s*/)
        if (nameParts.length >= 1) data.name = nameParts[0].trim()
        if (nameParts.length >= 2) data.headline = nameParts[1].trim()
        if (nameParts.length >= 3 && !nameParts[2].toLowerCase().includes('linkedin')) {
            data.company = nameParts[2].trim()
        }

        const companyMatch = ogDesc.match(/(?:at|@|with|chez|bei|en)\s+([A-Z][A-Za-z0-9\s&.,]+?)(?:\s*[·|•\-–]|\s*$)/i)
        if (companyMatch && !data.company) data.company = companyMatch[1].trim()

        const locationMatch = ogDesc.match(/(?:located in|based in|from|📍)\s+([A-Za-z\s,]+)/i)
        if (locationMatch) data.location = locationMatch[1].trim()

        if (data.name) data.insights.push(`Person: ${data.name}`)
        if (data.headline) data.insights.push(`Role: ${data.headline}`)
        if (data.company) data.insights.push(`Company: ${data.company}`)
    } else if (data.profileType === 'company') {
        data.company = ogTitle.replace(/\s*\|\s*LinkedIn/i, '').trim()
        data.insights.push(`Company: ${data.company}`)

        const websiteMatch = html.match(/(?:website|site|url)["\s:]+["']?(https?:\/\/[^"'\s<>]+)/i)
        if (websiteMatch) {
            try {
                data.companyDomain = new URL(websiteMatch[1]).hostname.replace(/^www\./, '')
                data.insights.push(`Website: ${data.companyDomain}`)
            } catch { }
        }
    }

    const jsonLdMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
    if (jsonLdMatch) {
        for (const block of jsonLdMatch) {
            try {
                const jsonContent = block.replace(/<\/?script[^>]*>/gi, '')
                const parsed = JSON.parse(jsonContent)
                if (parsed.name && !data.name) data.name = parsed.name
                if (parsed.jobTitle && !data.headline) data.headline = parsed.jobTitle
                if (parsed.worksFor?.name && !data.company) data.company = parsed.worksFor.name
                if (parsed.url && !data.companyDomain) {
                    try { data.companyDomain = new URL(parsed.url).hostname.replace(/^www\./, '') } catch { }
                }
            } catch { }
        }
    }

    return data
}

const deriveEmailsFromProfile = async (profileData, runId, entropy) => {
    const emails = []

    if (!profileData.name && !profileData.company) return emails

    if (profileData.companyDomain && profileData.name) {
        const derivedPatterns = generateEmailPatterns(profileData.name, profileData.companyDomain)
        for (const pattern of derivedPatterns) {
            const isRecruiter = /recruiter|talent|hr|hiring|people|staffing/i.test(profileData.headline || '')
            emails.push({
                address: pattern.email,
                category: isRecruiter ? 'HR/Recruiter' : 'Professional',
                confidence: pattern.confidence,
                source: 'linkedin-pattern-derived',
                isRecruiter,
                role: isRecruiter ? classifyRecruiterRole(profileData.headline || '') : 'Professional',
                derivedFrom: `LinkedIn: ${profileData.name}`,
                pattern: pattern.pattern
            })
        }
    }

    if (profileData.company && !profileData.companyDomain) {
        const guessedDomain = await guessCompanyDomain(profileData.company, runId, entropy)
        if (guessedDomain && profileData.name) {
            const derivedPatterns = generateEmailPatterns(profileData.name, guessedDomain)
            for (const pattern of derivedPatterns.slice(0, 2)) {
                const isRecruiter = /recruiter|talent|hr|hiring|people|staffing/i.test(profileData.headline || '')
                emails.push({
                    address: pattern.email,
                    category: isRecruiter ? 'HR/Recruiter' : 'Professional',
                    confidence: pattern.confidence * 0.7,
                    source: 'linkedin-pattern-derived-guessed-domain',
                    isRecruiter,
                    role: isRecruiter ? classifyRecruiterRole(profileData.headline || '') : 'Professional',
                    derivedFrom: `LinkedIn: ${profileData.name} @ ${profileData.company}`,
                    pattern: pattern.pattern,
                    domainGuessed: true
                })
            }
        }
    }

    return emails
}

// ─── Email Pattern Generation ───────────────────────────────────────────────

const generateEmailPatterns = (fullName, domain) => {
    const patterns = []
    const cleanName = fullName.replace(/[^a-zA-Z\s-]/g, '').trim()
    const parts = cleanName.split(/\s+/)

    if (parts.length < 2) return patterns

    const first = parts[0].toLowerCase()
    const last = parts[parts.length - 1].toLowerCase()
    const firstInitial = first[0]
    const lastInitial = last[0]

    const patternList = [
        { email: `${first}.${last}@${domain}`, pattern: 'first.last', confidence: 0.82 },
        { email: `${first}${last}@${domain}`, pattern: 'firstlast', confidence: 0.72 },
        { email: `${firstInitial}${last}@${domain}`, pattern: 'flast', confidence: 0.70 },
        { email: `${first}@${domain}`, pattern: 'first', confidence: 0.55 },
        { email: `${first}_${last}@${domain}`, pattern: 'first_last', confidence: 0.50 },
        { email: `${first}-${last}@${domain}`, pattern: 'first-last', confidence: 0.45 },
        { email: `${firstInitial}.${last}@${domain}`, pattern: 'f.last', confidence: 0.60 },
        { email: `${last}.${first}@${domain}`, pattern: 'last.first', confidence: 0.35 },
        { email: `${last}${firstInitial}@${domain}`, pattern: 'lastf', confidence: 0.30 },
        { email: `${first}${lastInitial}@${domain}`, pattern: 'firstl', confidence: 0.40 },
    ]

    return patternList
}

const guessCompanyDomain = async (companyName, runId, entropy) => {
    const simpleDomain = companyName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+(inc|corp|ltd|llc|gmbh|sarl|sa|sas|plc|co|company|group|international|intl)$/i, '')
        .replace(/\s+/g, '')
        .trim()

    if (simpleDomain) {
        for (const tld of ['.com', '.io', '.co', '.org', '.net']) {
            const testDomain = simpleDomain + tld
            const html = await fetchWithTimeout(`https://${testDomain}`, 5000)
            if (html) return testDomain
        }
    }

    try {
        const urls = await performWebSearch(`"${companyName}" official website`, 5)
        for (const url of urls) {
            try {
                const domain = new URL(url).hostname.replace(/^www\./, '')
                if (!isBlocklisted(url) && !domain.includes('linkedin') && !domain.includes('crunchbase') && !domain.includes('glassdoor')) {
                    return domain
                }
            } catch { }
        }
    } catch { }

    try {
        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}

What is the most likely official website domain for this company?
Company: ${companyName}

Return ONLY the domain (e.g., "apple.com"), nothing else.
If unsure, return "unknown".
`,
            `domain-${Date.now()}-${entropy}`,
            () => { },
            "You identify company website domains. Return only the domain."
        )
        const domain = raw.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
        if (domain && domain !== 'unknown' && domain.includes('.')) return domain
    } catch { }

    return null
}

// ─── Advanced Email Discovery ───────────────────────────────────────────────

const advancedEmailDiscovery = async (domain, companyName, html, runId, entropy) => {
    const discovered = []
    const seenEmails = new Set()

    const emailLookupUrls = await searchEmailDatabases(`${companyName} ${domain}`, '', 4)
    for (const lookupUrl of emailLookupUrls.slice(0, 3)) {
        try {
            const lookupHtml = await fetchWithTimeout(lookupUrl, 8000)
            if (!lookupHtml) continue
            const foundEmails = extractEmails(lookupHtml)
            for (const email of foundEmails) {
                if (email.includes(domain) && !seenEmails.has(email.toLowerCase())) {
                    seenEmails.add(email.toLowerCase())
                    const isRecruiter = /hr|recruit|talent|career|hiring|people/i.test(email.split('@')[0])
                    discovered.push({
                        address: email,
                        category: isRecruiter ? 'HR/Recruiter' : heuristicRole(email),
                        confidence: 0.75,
                        source: 'email-database-scrape',
                        isRecruiter,
                        role: isRecruiter ? classifyRecruiterRole(email.split('@')[0]) : heuristicRole(email)
                    })
                }
            }
        } catch { }
    }

    const githubEmails = await searchGitHubEmails(domain, companyName)
    for (const ge of githubEmails) {
        if (!seenEmails.has(ge.address.toLowerCase())) {
            seenEmails.add(ge.address.toLowerCase())
            discovered.push(ge)
        }
    }

    const whoisEmails = await discoverFromWhois(domain)
    for (const we of whoisEmails) {
        if (!seenEmails.has(we.address.toLowerCase())) {
            seenEmails.add(we.address.toLowerCase())
            discovered.push(we)
        }
    }

    const pressEmails = await searchPressReleaseEmails(companyName, domain)
    for (const pe of pressEmails) {
        if (!seenEmails.has(pe.address.toLowerCase())) {
            seenEmails.add(pe.address.toLowerCase())
            discovered.push(pe)
        }
    }

    if (discovered.length > 0) {
        const detectedPattern = detectEmailPattern(discovered.map(e => e.address), domain)
        if (detectedPattern) {
            const roleEmails = generateRoleEmails(detectedPattern, domain)
            for (const re of roleEmails) {
                if (!seenEmails.has(re.address.toLowerCase())) {
                    seenEmails.add(re.address.toLowerCase())
                    discovered.push(re)
                }
            }
        }
    }

    if (discovered.length < 3) {
        const aiEmails = await aiInferEmails(domain, companyName, discovered, runId, entropy)
        for (const ae of aiEmails) {
            if (!seenEmails.has(ae.address.toLowerCase())) {
                seenEmails.add(ae.address.toLowerCase())
                discovered.push(ae)
            }
        }
    }

    return discovered
}

// ─── Email Database Scraping ────────────────────────────────────────────────

const searchEmailDatabases = async (keywords, countryName, limit) => {
    const queries = [
        `${keywords} email contact ${countryName}`.trim(),
        `"${keywords}" "@" email address`,
        `${keywords} team contact email site:rocketreach.co OR site:hunter.io`,
    ]

    const allUrls = []
    for (const query of queries) {
        try {
            const urls = await performWebSearch(query, Math.ceil(limit / 2))
            allUrls.push(...urls)
        } catch { }
    }

    return [...new Set(allUrls)]
        .filter(u => isValidUrl(u) && !isBlocklisted(u))
        .slice(0, limit)
}

// ─── GitHub Email Discovery ────────────────────────────────────────────────

const searchGitHubEmails = async (domain, companyName) => {
    const emails = []

    try {
        const queries = [
            `site:github.com "${domain}" email`,
            `site:github.com "${companyName}" email "@${domain}"`,
        ]

        for (const query of queries) {
            const urls = await performWebSearch(query, 5)
            for (const url of urls.slice(0, 3)) {
                const html = await fetchWithTimeout(url, 8000)
                if (!html) continue
                const found = extractEmails(html)
                for (const email of found) {
                    if (email.includes(domain)) {
                        emails.push({
                            address: email,
                            category: 'Technical',
                            confidence: 0.65,
                            source: 'github-profile',
                            isRecruiter: false,
                            role: 'Technical/Developer'
                        })
                    }
                }
            }
        }
    } catch { }

    return emails
}

// ─── Whois / DNS Discovery ──────────────────────────────────────────────────

const discoverFromWhois = async (domain) => {
    const emails = []

    try {
        const queries = [
            `whois "${domain}" email`,
            `"${domain}" admin contact email`,
        ]

        for (const query of queries) {
            const urls = await performWebSearch(query, 3)
            for (const url of urls.slice(0, 2)) {
                const html = await fetchWithTimeout(url, 6000)
                if (!html) continue
                const found = extractEmails(html)
                for (const email of found) {
                    if (email.includes(domain)) {
                        emails.push({
                            address: email,
                            category: 'Administrative',
                            confidence: 0.6,
                            source: 'whois-record',
                            isRecruiter: /hr|recruit|talent|people/i.test(email.split('@')[0]),
                            role: 'Administrative Contact'
                        })
                    }
                }
            }
        }
    } catch { }

    return emails
}

// ─── Press Release Email Discovery ──────────────────────────────────────────

const searchPressReleaseEmails = async (companyName, domain) => {
    const emails = []

    try {
        const queries = [
            `"${companyName}" press release contact email`,
            `"${companyName}" media contact "@${domain}"`,
            `"${companyName}" PR contact email`,
        ]

        for (const query of queries) {
            const urls = await performWebSearch(query, 4)
            for (const url of urls.slice(0, 3)) {
                const html = await fetchWithTimeout(url, 8000)
                if (!html) continue
                const found = extractEmails(html)
                for (const email of found) {
                    if (email.includes(domain)) {
                        const localPart = email.split('@')[0].toLowerCase()
                        const isRecruiter = /hr|recruit|talent|career|hiring|people/i.test(localPart)
                        emails.push({
                            address: email,
                            category: isRecruiter ? 'HR/Recruiter' : 'PR/Media',
                            confidence: 0.7,
                            source: 'press-release',
                            isRecruiter,
                            role: isRecruiter ? classifyRecruiterRole(localPart) : 'PR/Media Contact'
                        })
                    }
                }
            }
        }
    } catch { }

    return emails
}

// ─── Archived Page Email Discovery ──────────────────────────────────────────

const searchArchivedPages = async (domain, companyName) => {
    const emails = []

    try {
        const paths = ['contact', 'careers']
        for (const path of paths) {
            try {
                const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${domain}/${path}*&output=json&limit=3&fl=timestamp,original&filter=statuscode:200`
                const cdxResponse = await fetchWithTimeout(cdxUrl, 8000)
                if (!cdxResponse) continue

                const cdxData = JSON.parse(cdxResponse)
                if (!Array.isArray(cdxData) || cdxData.length <= 1) continue

                for (let i = cdxData.length - 1; i >= 1 && i >= cdxData.length - 2; i--) {
                    const [timestamp, originalUrl] = cdxData[i]
                    const archiveUrl = `https://web.archive.org/web/${timestamp}/${originalUrl}`
                    const html = await fetchWithTimeout(archiveUrl, 10000)
                    if (!html) continue
                    const found = extractEmails(html)
                    for (const email of found) {
                        if (email.includes(domain)) {
                            const localPart = email.split('@')[0].toLowerCase()
                            const isRecruiter = /hr|recruit|talent|career|hiring|people/i.test(localPart)
                            emails.push({
                                address: email,
                                category: isRecruiter ? 'HR/Recruiter' : heuristicRole(email),
                                confidence: 0.55,
                                source: 'web-archive',
                                isRecruiter,
                                role: isRecruiter ? classifyRecruiterRole(localPart) : heuristicRole(email)
                            })
                        }
                    }
                }
            } catch { }
        }
    } catch { }

    return emails
}

// ─── Email Pattern Detection ────────────────────────────────────────────────

const detectEmailPattern = (emails, domain) => {
    const domainEmails = emails.filter(e => e.toLowerCase().includes(domain.toLowerCase()))
    if (domainEmails.length === 0) return null

    const patterns = {}
    for (const email of domainEmails) {
        const local = email.split('@')[0].toLowerCase()
        if (local.includes('.')) patterns['first.last'] = (patterns['first.last'] || 0) + 1
        else if (local.includes('_')) patterns['first_last'] = (patterns['first_last'] || 0) + 1
        else if (local.includes('-')) patterns['first-last'] = (patterns['first-last'] || 0) + 1
        else if (/^[a-z]{1}[a-z]+$/.test(local) && local.length > 4) patterns['firstlast'] = (patterns['firstlast'] || 0) + 1
        else if (/^[a-z]{1}[a-z]+$/.test(local) && local.length <= 4) patterns['flast'] = (patterns['flast'] || 0) + 1
    }

    const topPattern = Object.entries(patterns).sort((a, b) => b[1] - a[1])[0]
    return topPattern ? topPattern[0] : null
}

const generateRoleEmails = (pattern, domain) => {
    const roleNames = [
        { first: 'hr', role: 'HR Department', isRecruiter: true },
        { first: 'careers', role: 'Careers', isRecruiter: true },
        { first: 'talent', role: 'Talent Acquisition', isRecruiter: true },
        { first: 'recruitment', role: 'Recruitment', isRecruiter: true },
        { first: 'jobs', role: 'Jobs', isRecruiter: true },
        { first: 'info', role: 'General Info', isRecruiter: false },
        { first: 'contact', role: 'General Contact', isRecruiter: false },
    ]

    return roleNames.map(r => ({
        address: `${r.first}@${domain}`,
        category: r.isRecruiter ? 'HR/Recruiter' : 'Info',
        confidence: 0.5,
        source: 'pattern-generated-role',
        isRecruiter: r.isRecruiter,
        role: r.role,
        predicted: true
    }))
}

// ─── AI Email Inference ─────────────────────────────────────────────────────

const aiInferEmails = async (domain, companyName, existingEmails, runId, entropy) => {
    try {
        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}

Company: ${companyName}
Domain: ${domain}
Already discovered emails: ${JSON.stringify(existingEmails.map(e => e.address))}

Based on:
1. Standard business email conventions
2. The pattern of already discovered emails (if any)
3. Common role-based email addresses

Suggest the most likely ADDITIONAL email addresses for this company.
Focus on: HR, recruitment, careers, talent acquisition, general info, sales, support.

Rules:
- Only suggest emails @${domain}
- If you see a pattern in existing emails (e.g., first.last@), follow that pattern
- Confidence should be realistic (0.4-0.7 range for predicted emails)
- Max 5 suggestions
- Never suggest emails that are already in the discovered list

Return JSON array: [{address, role, confidence, isRecruiter: boolean, reasoning: string}]
`,
            `ai-email-${Date.now()}-${entropy}`,
            () => { },
            "You predict business email addresses based on patterns and conventions. Be conservative and realistic."
        )
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
        if (!Array.isArray(parsed)) return []

        return parsed
            .filter(e => e.address && e.address.includes('@') && e.confidence >= 0.3)
            .map(e => ({
                address: e.address,
                category: e.isRecruiter ? 'HR/Recruiter' : 'Professional',
                confidence: Math.min(e.confidence, 0.7),
                source: 'ai-inferred',
                isRecruiter: !!e.isRecruiter,
                role: e.role || 'Predicted',
                predicted: true,
                reasoning: e.reasoning
            }))
    } catch {
        return []
    }
}

// ─── Cross-Reference Email Sources ──────────────────────────────────────────

const crossReferenceEmailSources = async (domain, companyName, runId, entropy) => {
    const emails = []
    const seenEmails = new Set()

    const queries = [
        `"@${domain}" email`,
        `"${companyName}" contact "@${domain}"`,
        `"${domain}" team members email`,
        `"@${domain}" site:crunchbase.com OR site:glassdoor.com OR site:indeed.com`,
    ]

    for (const query of queries.slice(0, 3)) {
        try {
            const urls = await performWebSearch(query, 5)
            for (const url of urls.slice(0, 3)) {
                if (url.includes(domain)) continue
                const html = await fetchWithTimeout(url, 8000)
                if (!html) continue
                const found = extractEmails(html)
                for (const email of found) {
                    if (email.toLowerCase().includes(domain.toLowerCase()) && !seenEmails.has(email.toLowerCase())) {
                        seenEmails.add(email.toLowerCase())
                        const localPart = email.split('@')[0].toLowerCase()
                        const isRecruiter = /hr|recruit|talent|career|hiring|people/i.test(localPart)
                        emails.push({
                            address: email,
                            category: isRecruiter ? 'HR/Recruiter' : heuristicRole(email),
                            confidence: 0.65,
                            source: 'cross-reference',
                            isRecruiter,
                            role: isRecruiter ? classifyRecruiterRole(localPart) : heuristicRole(email)
                        })
                    }
                }
            }
        } catch { }
    }

    return emails
}

// ─── Recency Detection ─────────────────────────────────────────────────────

const detectRecencyIntent = async (keywords, currentYear, currentMonth, runId, entropy) => {
    try {
        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}
Today's date: ${currentMonth} ${currentYear}

Analyze this search query and determine if the user expects recent/latest/current information.

Query: "${keywords}"

Consider:
- Words like "latest", "newest", "recent", "current", "new", "2025", "2026", "upcoming", "just released", "this year"
- Product queries (e.g., "MacBook", "iPhone", "Tesla Model") usually imply the LATEST version
- News-style queries imply recency
- Historical or educational queries do NOT imply recency
- Company research queries are neutral

Return JSON only:
{
  "isRecent": true/false,
  "timeframe": "description of expected time range" or null,
  "minYear": ${currentYear - 1} or ${currentYear} or null,
  "reasoning": "brief explanation"
}
`,
            `recency-${Date.now()}-${entropy}`,
            () => { },
            "You analyze search intent for temporal expectations. Be accurate about what users expect."
        )
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
        return {
            isRecent: !!parsed.isRecent,
            timeframe: parsed.timeframe || null,
            minYear: parsed.minYear || currentYear - 1,
            reasoning: parsed.reasoning || ''
        }
    } catch {
        const recencyWords = /\b(latest|newest|recent|current|new|upcoming|just released|this year|now|today)\b/i
        const yearMention = keywords.match(/\b(20[2-3]\d)\b/)
        const productWords = /\b(macbook|iphone|ipad|galaxy|pixel|tesla|model|release|launch|version|update)\b/i

        const isRecent = recencyWords.test(keywords) || productWords.test(keywords) || !!yearMention
        return {
            isRecent,
            timeframe: yearMention ? `around ${yearMention[1]}` : (isRecent ? `${currentYear - 1}-${currentYear}` : null),
            minYear: yearMention ? parseInt(yearMention[1]) - 1 : currentYear - 1,
            reasoning: 'heuristic fallback'
        }
    }
}

const extractYearFromDate = (dateStr) => {
    if (!dateStr) return null
    const match = dateStr.match(/\b(20[1-3]\d)\b/)
    return match ? parseInt(match[1]) : null
}

// ─── Output Format Decision ─────────────────────────────────────────────────

const decideOutputFormat = async (results, keywords, includeRecruiterEmails, runId, entropy, emailHuntingMode) => {
    try {
        const resultSummary = results.map(r => ({
            type: r.resultType,
            title: r.title,
            hasEmails: (r.emails?.length || 0) > 0,
            hasRecruiterEmails: (r.recruiterEmails?.length || 0) > 0,
            insightCount: r.keyInsights?.length || 0,
            hasLinkedInData: !!r.linkedInData,
            source: r.source
        }))

        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}

You must decide the best way to present search results to the user.

User query: "${keywords}"
Include recruiter emails: ${includeRecruiterEmails}
Email hunting mode: ${emailHuntingMode?.isEmailFocused ? emailHuntingMode.strategy : 'off'}
Results found: ${results.length}
Result types: ${JSON.stringify(resultSummary)}
Total emails: ${results.reduce((s, r) => s + (r.emails?.length || 0), 0)}
Total recruiter emails: ${results.reduce((s, r) => s + (r.recruiterEmails?.length || 0), 0)}

Choose the BEST presentation format. Options:

1. "table" — Best for: structured comparisons, lists of companies with emails, contact directories
2. "narrative" — Best for: news summaries, trend analysis, answering specific questions, research topics
3. "cards" — Best for: mixed content types, people profiles, LinkedIn results, visual hierarchy
4. "hybrid" — Best for: combining narrative with tables, email-focused results with context
5. "list" — Best for: simple enumerations, resource links, quick references
6. "contact-report" — Best for: when the primary goal is finding emails/contacts/recruiters

Consider:
- If email hunting mode is active and emails were found → contact-report or hybrid
- If results include LinkedIn profiles → cards work well
- If results are mostly companies with emails → table works great
- If results are mostly news/articles → narrative or hybrid
- If results are mixed → cards or hybrid
- If the user asked a question → narrative
- If results are few (1-3) → narrative is more natural

Return JSON only:
{
  "format": "table" | "narrative" | "cards" | "hybrid" | "list" | "contact-report",
  "reasoning": "brief explanation",
  "sections": ["what sections to include"],
  "tone": "professional" | "conversational" | "technical" | "brief"
}
`,
            `fmt-${Date.now()}-${entropy}`,
            () => { },
            "You are a UX-aware report designer. Choose the most readable, appropriate format."
        )
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
        return {
            format: ['table', 'narrative', 'cards', 'hybrid', 'list', 'contact-report'].includes(parsed.format) ? parsed.format : 'hybrid',
            reasoning: parsed.reasoning || '',
            sections: Array.isArray(parsed.sections) ? parsed.sections : [],
            tone: parsed.tone || 'professional'
        }
    } catch {
        const types = results.map(r => r.resultType)
        const companyCount = types.filter(t => t === 'company').length
        const newsCount = types.filter(t => t === 'news').length
        const hasLinkedIn = results.some(r => r.linkedInData)
        const totalEmails = results.reduce((s, r) => s + (r.emails?.length || 0) + (r.recruiterEmails?.length || 0), 0)

        if (emailHuntingMode?.isEmailFocused && totalEmails > 0) return { format: 'contact-report', reasoning: 'email hunting with results', sections: [], tone: 'professional' }
        if (hasLinkedIn) return { format: 'cards', reasoning: 'linkedin profiles present', sections: [], tone: 'professional' }
        if (companyCount > results.length * 0.6) return { format: 'table', reasoning: 'mostly companies', sections: [], tone: 'professional' }
        if (newsCount > results.length * 0.6) return { format: 'narrative', reasoning: 'mostly news', sections: [], tone: 'professional' }
        if (results.length <= 3) return { format: 'narrative', reasoning: 'few results', sections: [], tone: 'conversational' }
        return { format: 'hybrid', reasoning: 'mixed content', sections: [], tone: 'professional' }
    }
}

// ─── Query Generation (Enhanced) ───────────────────────────────────────────

const generateSearchQueries = async ({ keywords, countryName, isGlobal, includeRecruiterEmails, runId, entropy, phase, foundSoFar, recencyIntent, currentYear, currentMonth, emailHuntingMode }) => {
    const scopeInstruction = isGlobal
        ? 'Search worldwide — include results from multiple regions and languages.'
        : `Focus on results from or about ${countryName}.`

    const recruiterInstruction = includeRecruiterEmails
        ? '\nAlso include 2 queries specifically targeting company career pages, HR contacts, and recruiter emails in this field.'
        : ''

    const recencyInstruction = recencyIntent?.isRecent
        ? `\nIMPORTANT: The user expects RECENT/CURRENT information (${recencyIntent.timeframe}). 
Include year markers like "${currentYear}" or "${currentMonth} ${currentYear}" in at least half the queries.
Prefer queries that will surface the newest content.`
        : ''

    const emailInstruction = emailHuntingMode?.isEmailFocused
        ? `\nEMAIL HUNTING MODE (${emailHuntingMode.strategy}):
Include queries designed to find email addresses, such as:
- site: searches for contact/team/about pages
- Queries for "@domain.com" patterns
- LinkedIn profile searches for relevant people
- Searches on email lookup platforms
- Press releases and news with contact info
- GitHub profiles with company domain emails
At least 3 queries should be specifically designed to surface email addresses.`
        : ''

    try {
        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}
Phase:${phase}
Today's date: ${currentMonth} ${new Date().getDate()}, ${currentYear}

Goal: find the most relevant and diverse web results for the user's query.

User query: ${keywords}
Geographic scope: ${scopeInstruction}${recruiterInstruction}${recencyInstruction}${emailInstruction}
Already found: ${foundSoFar || 'nothing yet'}

Generate 5 focused search queries to maximize coverage:
- 2 direct/exact queries related to what the user asked
- 2 queries exploring related news, trends, or recent developments
- 1 query approaching from an alternative angle (industry reports, expert opinions, directories)

Each query should be unique and explore a different aspect.
Never repeat structures from previous phases.
Use natural search language.
${recencyIntent?.isRecent ? `At least 4 queries MUST include "${currentYear}" or time-specific terms.` : ''}

Return JSON array of strings only.
`,
            `q-${Date.now()}-${entropy}`,
            () => { },
            "You generate intelligent, diverse web search queries. Always be aware of the current date and the user's intent (information vs email discovery vs news)."
        )
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
        return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
        const location = isGlobal ? '' : ` ${countryName}`
        const yearStr = recencyIntent?.isRecent ? ` ${currentYear}` : ''
        const base = [
            `${keywords}${location}${yearStr}`,
            `${keywords} latest news${location} ${currentYear}`,
            `${keywords} companies${location}`,
            `${keywords} industry trends ${currentYear}`,
            `best ${keywords}${location}${yearStr}`,
            `${keywords} report analysis ${currentYear}`,
            `${keywords} review guide${yearStr}`,
            `${keywords} directory list`
        ]
        if (includeRecruiterEmails || emailHuntingMode?.isEmailFocused) {
            base.push(`${keywords} careers hiring HR email${location}`)
            base.push(`${keywords} recruitment team contact email${location}`)
            base.push(`${keywords} "@" email contact${location}`)
        }
        return base
    }
}

// ─── Relevance Scoring (Fast heuristic — no LLM call) ──────────────────────

const scoreRelevanceFast = (domain, url, html, keywords, recencyIntent, currentYear) => {
    const title = (getTitleTag(html) || '').toLowerCase()
    const description = (getMetaContent(html, 'description') || getMetaContent(html, 'og:description') || '').toLowerCase()
    const text = (title + ' ' + description + ' ' + domain).toLowerCase()

    const kws = keywords.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    if (kws.length === 0) return 0.5

    let matchCount = 0
    for (const kw of kws) {
        if (text.includes(kw)) matchCount++
    }
    let score = matchCount / kws.length

    if (/apple\.com|google\.com|amazon|microsoft|reuters|bbc|cnn|techcrunch|theverge|wired|engadget|arstechnica|forbes|bloomberg/i.test(domain)) score += 0.15

    if (recencyIntent?.isRecent) {
        const dateSignals = extractDateSignals(html)
        if (dateSignals) {
            const pageYear = extractYearFromDate(dateSignals)
            if (pageYear) {
                if (pageYear >= currentYear) score += 0.15
                else if (pageYear === currentYear - 1) score += 0.05
                else if (pageYear <= currentYear - 3) score -= 0.2
            }
        }
    }

    return Math.min(Math.max(score, 0), 1)
}

const extractDateSignals = (html) => {
    const datePatterns = [
        /(?:published_time|datePublished|date|article:published_time|DC\.date)["\s:=]+["']?(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
        /"datePublished"\s*:\s*"([^"]+)"/i,
        /"dateModified"\s*:\s*"([^"]+)"/i,
        /<time[^>]+datetime="([^"]+)"/i,
        /(?:Published|Posted|Updated|Date)[:\s]+(\w+ \d{1,2},?\s*\d{4})/i,
        /(?:Published|Posted|Updated|Date)[:\s]+(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
    ]

    for (const pattern of datePatterns) {
        const match = html.match(pattern)
        if (match) return match[1]
    }

    const metaDate = getMetaContent(html, 'article:published_time')
        || getMetaContent(html, 'datePublished')
        || getMetaContent(html, 'date')
        || getMetaContent(html, 'DC.date')

    if (metaDate) return metaDate
    return null
}

// ─── Report Generation (AI-Decided Format) ──────────────────────────────────

const generateReport = async (results, summary, includeRecruiterEmails, keywords, formatDecision, runId, entropy, currentYear, emailHuntingMode) => {
    const format = formatDecision.format

    switch (format) {
        case 'narrative':
            return await generateNarrativeReport(results, summary, includeRecruiterEmails, keywords, formatDecision, runId, entropy, currentYear)
        case 'cards':
            return generateCardsReport(results, summary, includeRecruiterEmails, keywords)
        case 'list':
            return generateListReport(results, summary, includeRecruiterEmails, keywords)
        case 'hybrid':
            return await generateHybridReport(results, summary, includeRecruiterEmails, keywords, formatDecision, runId, entropy, currentYear)
        case 'contact-report':
            return generateContactReport(results, summary, includeRecruiterEmails, keywords, emailHuntingMode)
        case 'table':
        default:
            return generateTableReport(results, summary, includeRecruiterEmails, keywords)
    }
}

const generateContactReport = (results, summary, includeRecruiterEmails, keywords, emailHuntingMode) => {
    let md = `\n### 📧 Contact Discovery Report — "${keywords}"\n\n`
    if (summary) md += `> ${summary.trim()}\n\n`

    const allContacts = []
    for (const r of results) {
        if (r.recruiterEmails?.length) {
            for (const re of r.recruiterEmails) {
                allContacts.push({
                    ...re,
                    company: r.title,
                    domain: r.domain,
                    sourceUrl: r.url,
                    contactType: 'recruiter'
                })
            }
        }
        if (r.emails?.length) {
            for (const e of r.emails) {
                allContacts.push({
                    ...e,
                    company: r.title,
                    domain: r.domain,
                    sourceUrl: r.url,
                    contactType: 'general'
                })
            }
        }
    }

    allContacts.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))

    const recruiterContacts = allContacts.filter(c => c.contactType === 'recruiter' || c.isRecruiter)
    const otherContacts = allContacts.filter(c => c.contactType !== 'recruiter' && !c.isRecruiter)

    md += `**Discovery Stats:**\n`
    md += `- 🔍 Sources analyzed: ${results.length}\n`
    md += `- 👤 Recruiter/HR contacts: ${recruiterContacts.length}\n`
    md += `- 📧 Other contacts: ${otherContacts.length}\n`
    md += `- 🎯 Strategy: ${emailHuntingMode?.strategy || 'standard'}\n\n`

    if (recruiterContacts.length) {
        md += `#### 👤 Recruiter & HR Contacts\n\n`
        md += `| Email | Role | Company | Confidence | Source |\n`
        md += `| :--- | :--- | :--- | :--- | :--- |\n`
        recruiterContacts.forEach(c => {
            const conf = c.confidence ? `${Math.round(c.confidence * 100)}%` : '-'
            const source = tableCell(c.source || c.contactType, 30)
            const predicted = c.predicted ? ' ⚡' : ''
            const role = tableCell(c.role, 25)
            const company = tableCell(c.company, 40)
            md += `| **${tableCell(c.address, 50)}**${predicted} | ${role} | [${company}](${c.sourceUrl}) | ${conf} | ${source} |\n`
        })
        md += '\n'
        if (recruiterContacts.some(c => c.predicted)) {
            md += `> ⚡ = AI-predicted pattern (verify before sending)\n\n`
        }
    }

    if (otherContacts.length) {
        md += `#### 📧 Other Business Contacts\n\n`
        md += `| Email | Category | Company | Confidence | Source |\n`
        md += `| :--- | :--- | :--- | :--- | :--- |\n`
        otherContacts.forEach(c => {
            const conf = c.confidence ? `${Math.round(c.confidence * 100)}%` : '-'
            const source = tableCell(c.source || 'web-scrape', 30)
            const predicted = c.predicted ? ' ⚡' : ''
            const category = tableCell(c.category, 25)
            const company = tableCell(c.company, 40)
            md += `| **${tableCell(c.address, 50)}**${predicted} | ${category} | [${company}](${c.sourceUrl}) | ${conf} | ${source} |\n`
        })
        md += '\n'
    }

    const linkedInResults = results.filter(r => r.linkedInData)
    if (linkedInResults.length) {
        md += `#### 🔗 LinkedIn Profiles Found\n\n`
        linkedInResults.forEach(r => {
            const ld = r.linkedInData
            md += `- **[${ld.name || r.title}](${r.url})**`
            if (ld.headline) md += ` — ${ld.headline}`
            if (ld.company) md += ` @ ${ld.company}`
            md += '\n'
        })
        md += '\n'
    }

    const noContactResults = results.filter(r =>
        (!r.emails || r.emails.length === 0) &&
        (!r.recruiterEmails || r.recruiterEmails.length === 0) &&
        !r.linkedInData
    )
    if (noContactResults.length) {
        md += `#### 🔍 Sources Analyzed (No Direct Contacts Found)\n\n`
        noContactResults.forEach(r => {
            md += `- [${r.title}](${r.url}) — ${r.description || r.domain}\n`
        })
        md += '\n'
    }

    return md
}

const generateNarrativeReport = async (results, summary, includeRecruiterEmails, keywords, formatDecision, runId, entropy, currentYear) => {
    try {
        const resultData = results.map(r => ({
            title: r.title,
            domain: r.domain,
            url: r.url,
            type: r.resultType,
            description: r.description,
            keyInsights: r.keyInsights,
            emails: r.emails?.slice(0, 3),
            recruiterEmails: includeRecruiterEmails ? r.recruiterEmails?.slice(0, 3) : undefined,
            publishDate: r.publishDate || null,
            linkedInData: r.linkedInData || null
        }))

        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}
Current year: ${currentYear}

Write a well-structured, informative research report in markdown format.

User query: "${keywords}"
Summary: ${summary}
Tone: ${formatDecision.tone}

Results data:
${JSON.stringify(resultData, null, 2)}

Guidelines:
- Start with a clear heading using the query topic
- Write a brief executive summary (2-3 sentences)
- Organize findings into logical sections with subheadings
- For each key finding, mention the source with a markdown link
- Highlight the most important insights
- If there are emails or contacts, integrate them naturally into the text
${includeRecruiterEmails ? '- Include a dedicated "Key Contacts" section for recruiter/HR emails found' : ''}
- End with a brief "Key Takeaways" section (bullet points)
- Use bold, italic, and other markdown formatting for readability
- Do NOT use tables unless absolutely necessary
- Keep it concise but comprehensive
- Current year is ${currentYear}

Return markdown only, no code blocks.
`,
            `narr-${Date.now()}-${entropy}`,
            () => { },
            "You write clear, well-structured research reports in markdown."
        )
        return '\n' + raw.trim() + '\n'
    } catch {
        return generateTableReport(results, summary, includeRecruiterEmails, keywords)
    }
}

const generateHybridReport = async (results, summary, includeRecruiterEmails, keywords, formatDecision, runId, entropy, currentYear) => {
    try {
        const resultData = results.map(r => ({
            title: r.title,
            domain: r.domain,
            url: r.url,
            type: r.resultType,
            description: r.description,
            keyInsights: r.keyInsights,
            emailCount: r.emails?.length || 0,
            topEmail: r.emails?.sort((a, b) => b.confidence - a.confidence)?.[0]?.address || null,
            recruiterEmails: includeRecruiterEmails ? r.recruiterEmails?.slice(0, 3) : undefined,
            publishDate: r.publishDate || null,
            linkedInData: r.linkedInData || null
        }))

        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}
Current year: ${currentYear}

Write a research report combining narrative analysis with structured data.

User query: "${keywords}"
Summary: ${summary}
Tone: ${formatDecision.tone}

Results data:
${JSON.stringify(resultData, null, 2)}

Guidelines:
- Start with heading and 2-3 sentence overview
- Group results by type or theme
- Use narrative paragraphs for analysis
- Use SMALL tables only where comparison is genuinely useful
- Use bullet points for insights/resource lists
- Link to sources using markdown links
${includeRecruiterEmails ? '- Include recruiter contacts in a clear format' : ''}
- End with brief takeaways
- Current year is ${currentYear}
- Mix formatting: headings, bold, bullets, occasional tables, blockquotes

Return markdown only, no code blocks.
`,
            `hybrid-${Date.now()}-${entropy}`,
            () => { },
            "You create hybrid research reports blending narrative with structured data."
        )
        return '\n' + raw.trim() + '\n'
    } catch {
        return generateTableReport(results, summary, includeRecruiterEmails, keywords)
    }
}

const generateCardsReport = (results, summary, includeRecruiterEmails, keywords) => {
    let md = `\n### 🔍 Research Results — "${keywords}"\n\n`
    if (summary) md += `> ${summary.trim()}\n\n`
    md += `---\n\n`

    results.forEach((r, i) => {
        const icon = r.favicon ? `<img src="${r.favicon}" width="16" height="16" style="vertical-align:middle;margin-right:6px;border-radius:4px;" />` : ''
        const typeEmoji = getTypeEmoji(r.resultType)

        md += `#### ${typeEmoji} ${icon}${r.title}\n\n`
        md += `🔗 [${r.domain}](${r.url})`
        if (r.publishDate) md += ` · 📅 ${r.publishDate}`
        if (r.linkedInData?.headline) md += ` · 💼 ${r.linkedInData.headline}`
        md += `\n\n`

        if (r.description) md += `${r.description}\n\n`

        if (r.linkedInData) {
            if (r.linkedInData.company) md += `🏢 **Company:** ${r.linkedInData.company}\n`
            if (r.linkedInData.location) md += `📍 **Location:** ${r.linkedInData.location}\n`
            md += '\n'
        }

        if (r.keyInsights?.length) {
            md += `**Key Insights:**\n`
            r.keyInsights.forEach(insight => {
                md += `- ${insight}\n`
            })
            md += '\n'
        }

        if (r.emails?.length) {
            const best = r.emails.sort((a, b) => b.confidence - a.confidence)[0]
            md += `📧 **Contact:** ${best.address} _(${best.category})_`
            if (best.source) md += ` — via ${best.source}`
            md += '\n\n'
        }

        if (includeRecruiterEmails && r.recruiterEmails?.length) {
            md += `👤 **Recruiter Contacts:**\n`
            r.recruiterEmails.forEach(re => {
                const predicted = re.predicted ? ' ⚡' : ''
                md += `- ${re.address}${predicted} — _${re.role}_ (${Math.round(re.confidence * 100)}%)\n`
            })
            md += '\n'
        }

        if (i < results.length - 1) md += `---\n\n`
    })

    return md
}

const generateListReport = (results, summary, includeRecruiterEmails, keywords) => {
    let md = `\n### 🔍 Results for "${keywords}"\n\n`
    if (summary) md += `> ${summary.trim()}\n\n`

    const grouped = {}
    results.forEach(r => {
        const type = r.resultType || 'other'
        if (!grouped[type]) grouped[type] = []
        grouped[type].push(r)
    })

    for (const [type, items] of Object.entries(grouped)) {
        md += `#### ${getTypeEmoji(type)} ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`
        items.forEach(r => {
            md += `- **[${r.title}](${r.url})** — ${r.description || r.domain}`
            if (r.emails?.length) {
                const best = r.emails.sort((a, b) => b.confidence - a.confidence)[0]
                md += ` · 📧 ${best.address}`
            }
            if (includeRecruiterEmails && r.recruiterEmails?.length) {
                md += ` · 👤 ${r.recruiterEmails[0].address}`
            }
            md += '\n'
        })
        md += '\n'
    }

    return md
}

const generateTableReport = (results, summary, includeRecruiterEmails, keywords) => {
    let md = `\n### 🌍 Web Intelligence Report — "${keywords}"\n\n`
    if (summary) md += `> *${summary.trim()}*\n\n`

    const companies = results.filter(r => r.resultType === 'company')
    const news = results.filter(r => r.resultType === 'news')
    const articles = results.filter(r => r.resultType === 'article' || r.resultType === 'research')
    const people = results.filter(r => r.resultType === 'person')
    const others = results.filter(r => !['company', 'news', 'article', 'research', 'person'].includes(r.resultType))

    if (people.length) {
        md += `#### 👤 People (${people.length})\n\n`
        md += `| Name | Role/Headline | Company | Contact | Source |\n`
        md += `| :--- | :--- | :--- | :--- | :--- |\n`
        people.forEach(r => {
            const ld = r.linkedInData || {}
            const name = tableCell(ld.name || r.title, 40)
            const headline = tableCell(ld.headline || r.description, 60)
            const company = tableCell(ld.company, 40)
            const email = r.emails?.length ? tableCell(r.emails[0].address, 50) : (r.recruiterEmails?.length ? tableCell(r.recruiterEmails[0].address, 50) : '_N/A_')
            md += `| **${name}** | ${headline} | ${company} | ${email} | [Profile](${r.url}) |\n`
        })
        md += '\n'
    }

    if (companies.length) {
        md += `#### 🏢 Companies (${companies.length})\n\n`
        if (includeRecruiterEmails) {
            md += `| Company | Domain | Contact | Recruiter / HR | Description |\n`
            md += `| :--- | :--- | :--- | :--- | :--- |\n`
        } else {
            md += `| Company | Domain | Contact | Description |\n`
            md += `| :--- | :--- | :--- | :--- |\n`
        }
        companies.forEach(r => {
            const best = r.emails?.sort((a, b) => b.confidence - a.confidence)[0]
            const email = best ? `**${tableCell(best.address, 50)}**` : '_N/A_'
            const icon = r.favicon ? `<img src="${r.favicon}" width="16" height="16" style="vertical-align:middle;margin-right:6px;border-radius:4px;" />` : ''
            const desc = tableCell(r.description || 'Active company', 80)
            const title = tableCell(r.title, 50)
            if (includeRecruiterEmails) {
                const rec = r.recruiterEmails?.length
                    ? r.recruiterEmails.map(re => `**${tableCell(re.address, 50)}** _(${tableCell(re.role, 20)}, ${Math.round(re.confidence * 100)}%)_`).join(', ')
                    : '_Not found_'
                md += `| ${icon}**${title}** | [${r.domain}](https://${r.domain}) | ${email} | ${rec} | ${desc} |\n`
            } else {
                md += `| ${icon}**${title}** | [${r.domain}](https://${r.domain}) | ${email} | ${desc} |\n`
            }
        })
        md += '\n'
    }

    if (news.length) {
        md += `#### 📰 News (${news.length})\n\n`
        md += `| Source | Title | Key Insight |\n`
        md += `| :--- | :--- | :--- |\n`
        news.forEach(r => {
            const insight = tableCell(r.keyInsights?.[0] || r.description, 100)
            const source = tableCell(r.siteName || r.domain, 30)
            const title = tableCell(r.title, 60)
            md += `| [${source}](https://${r.domain}) | **${title}** | ${insight} |\n`
        })
        md += '\n'
    }

    if (articles.length) {
        md += `#### 📄 Articles & Research (${articles.length})\n\n`
        md += `| Source | Title | Summary |\n`
        md += `| :--- | :--- | :--- |\n`
        articles.forEach(r => {
            const source = tableCell(r.siteName || r.domain, 30)
            const title = tableCell(r.title, 60)
            const desc = tableCell(r.description, 100)
            md += `| [${source}](https://${r.domain}) | **${title}** | ${desc} |\n`
        })
        md += '\n'
    }

    if (others.length) {
        md += `#### 🔗 Other Resources (${others.length})\n\n`
        md += `| Source | Title | Type | Description |\n`
        md += `| :--- | :--- | :--- | :--- |\n`
        others.forEach(r => {
            const source = tableCell(r.siteName || r.domain, 30)
            const title = tableCell(r.title, 60)
            const desc = tableCell(r.description, 100)
            md += `| [${source}](https://${r.domain}) | **${title}** | ${r.resultType || 'other'} | ${desc} |\n`
        })
        md += '\n'
    }

    return md
}

const getTypeEmoji = (type) => {
    const map = {
        company: '🏢', news: '📰', article: '📄', research: '🔬',
        tool: '🛠️', directory: '📋', resource: '📚', person: '👤', other: '🔗'
    }
    return map[type] || '🔗'
}

const tableCell = (text, maxLen = 120) => {
    if (!text) return '-'
    return String(text).replace(/\|/g, '∣').replace(/[\r\n]+/g, ' ').trim().slice(0, maxLen) || '-'
}

// ─── Result Processing (Enhanced) ───────────────────────────────────────────

const processWebResult = async (url, html, keywords, runId, entropy, includeRecruiterEmails = false, currentYear = new Date().getFullYear()) => {
    try {
        const domain = new URL(url).hostname.replace(/^www\./, '')
        const title = getMetaContent(html, 'og:title') || getTitleTag(html) || domain
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        const siteName = getMetaContent(html, 'og:site_name') || domain
        const ogDescription = getMetaContent(html, 'og:description') || getMetaContent(html, 'description') || ''
        const ogImage = getMetaContent(html, 'og:image') || ''
        const emails = extractEmails(html)
        const publishDate = extractDateSignals(html)

        const analysis = await analyzePageContent(title, domain, url, html, keywords, runId, entropy, currentYear)

        let recruiterEmails = []
        if (includeRecruiterEmails && analysis.resultType === 'company') {
            recruiterEmails = extractRecruiterEmails(html)
            const subPages = extractSubPageUrls(url, html, ['career', 'jobs', 'hiring', 'team', 'about', 'contact', 'people', 'join', 'work-with-us', 'recrutement', 'emploi'])
            for (const subUrl of subPages.slice(0, 5)) {
                const subHtml = await fetchWithTimeout(subUrl, 8000)
                if (subHtml) {
                    recruiterEmails.push(...extractRecruiterEmails(subHtml))
                    emails.push(...extractEmails(subHtml))
                }
            }
            recruiterEmails = deduplicateRecruiterEmails(recruiterEmails)
        }

        const uniqueEmails = [...new Set(emails)]
        const classified = uniqueEmails.length ? await classifyEmails(uniqueEmails, domain, runId, entropy) : []

        return {
            title: title.trim(),
            domain,
            url,
            favicon,
            siteName,
            ogImage,
            resultType: analysis.resultType,
            description: analysis.description || ogDescription || 'No description available',
            keyInsights: analysis.keyInsights || [],
            publishDate: publishDate || null,
            emails: classified,
            recruiterEmails,
            source: 'Web Intelligence'
        }
    } catch {
        return null
    }
}

const analyzePageContent = async (title, domain, url, html, keywords, runId, entropy, currentYear = new Date().getFullYear()) => {
    try {
        const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2500)
        const dateSignals = extractDateSignals(html)

        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}
Current year: ${currentYear}

Analyze this webpage and extract structured intelligence.

Title: ${title}
Domain: ${domain}
URL: ${url}
User's search: ${keywords}
Detected publish date: ${dateSignals || 'unknown'}

Content:
${textContent}

Return JSON:
{
  "resultType": "company" | "news" | "article" | "directory" | "tool" | "resource" | "research" | "person" | "other",
  "description": "concise factual summary in max 25 words",
  "keyInsights": ["insight 1", "insight 2", "insight 3"]
}

Be factual. Return JSON only.
`,
            `analyze-${Date.now()}-${entropy}`,
            () => { },
            "You analyze web pages and classify their content type and extract key insights."
        )
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
        return {
            resultType: parsed.resultType || 'other',
            description: parsed.description || '',
            keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : []
        }
    } catch {
        return { resultType: 'other', description: '', keyInsights: [] }
    }
}

// ─── Web Search Engines ─────────────────────────────────────────────────────

const performWebSearch = async (query, limit) => {
    try {
        const c = new AbortController()
        setTimeout(() => c.abort(), 8000)
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=wt-wt`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            signal: c.signal
        })
        const html = await res.text()
        const urls = []

        const patterns = [
            /<a[^>]+class="result__a"[^>]+href="([^"]+)"/gi,
            /<a[^>]+href="([^"]+)"[^>]+class="result__a"/gi,
            /<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"/gi,
            /class="result__a"[^>]*href="([^"]+)"/gi,
            /href="(\/l\/[^"]+)"/gi,
        ]

        for (const rx of patterns) {
            let m
            while ((m = rx.exec(html)) !== null && urls.length < limit) {
                let u = m[1]
                if (u.includes('uddg=')) {
                    try { u = decodeURIComponent(new URLSearchParams(u.split('?')[1]).get('uddg')) } catch { continue }
                }
                if (u.startsWith('/l/')) {
                    try {
                        const parsed = new URL('https://duckduckgo.com' + u)
                        u = decodeURIComponent(parsed.searchParams.get('uddg') || '')
                    } catch { continue }
                }
                if (u && isValidUrl(u) && !isSearchBlocklisted(u) && !urls.includes(u)) urls.push(u)
            }
            if (urls.length >= limit) break
        }

        return urls
    } catch {
        return []
    }
}

const performRegionalSearch = async (query, limit, regionCode) => {
    const regionMap = {
        us: 'us-en', gb: 'uk-en', ca: 'ca-en', de: 'de-de', fr: 'fr-fr',
        au: 'au-en', es: 'es-es', it: 'it-it', nl: 'nl-nl', br: 'br-pt',
        in: 'in-en', jp: 'jp-jp', cn: 'cn-zh', ma: 'xa-ar', sa: 'xa-ar',
        ae: 'xa-ar', eg: 'xa-ar', za: 'xa-en', ng: 'xa-en', ke: 'xa-en',
        kr: 'kr-kr', mx: 'mx-es', ar: 'ar-es', cl: 'cl-es', co: 'co-es',
        se: 'se-sv', no: 'no-no', dk: 'dk-da', fi: 'fi-fi', pl: 'pl-pl',
        pt: 'pt-pt', be: 'be-fr', at: 'at-de', ch: 'ch-de', ie: 'ie-en',
        nz: 'nz-en', sg: 'sg-en', hk: 'hk-tzh', tw: 'tw-tzh', th: 'th-th',
        id: 'id-id', my: 'my-en', ph: 'ph-en', vn: 'vn-vi', tr: 'tr-tr',
        ru: 'ru-ru', ua: 'ua-uk', ro: 'ro-ro', cz: 'cz-cs', hu: 'hu-hu',
        il: 'il-he', pk: 'pk-en', bd: 'bd-en', lk: 'lk-en'
    }
    const kl = regionCode ? (regionMap[regionCode.toLowerCase()] || 'wt-wt') : 'wt-wt'
    try {
        const c = new AbortController()
        setTimeout(() => c.abort(), 8000)
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=${kl}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            signal: c.signal
        })
        const html = await res.text()
        const urls = []
        const patterns = [
            /<a[^>]+class="result__a"[^>]+href="([^"]+)"/gi,
            /<a[^>]+href="([^"]+)"[^>]+class="result__a"/gi,
            /<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"/gi,
            /href="(\/l\/[^"]+)"/gi,
        ]
        for (const rx of patterns) {
            let m
            while ((m = rx.exec(html)) !== null && urls.length < limit) {
                let u = m[1]
                if (u.includes('uddg=')) {
                    try { u = decodeURIComponent(new URLSearchParams(u.split('?')[1]).get('uddg')) } catch { continue }
                }
                if (u.startsWith('/l/')) {
                    try {
                        const parsed = new URL('https://duckduckgo.com' + u)
                        u = decodeURIComponent(parsed.searchParams.get('uddg') || '')
                    } catch { continue }
                }
                if (u && isValidUrl(u) && !isSearchBlocklisted(u) && !urls.includes(u)) urls.push(u)
            }
            if (urls.length >= limit) break
        }
        return urls
    } catch {
        return []
    }
}

const performGlobalSearch = async (query, limit, regionCode) => {
    const [globalResults, regionalResults] = await Promise.all([
        performWebSearch(query, limit),
        regionCode ? performRegionalSearch(query, limit, regionCode) : Promise.resolve([])
    ])
    const seen = new Set()
    const merged = []
    for (const u of [...globalResults, ...regionalResults]) {
        if (!seen.has(u)) {
            seen.add(u)
            merged.push(u)
        }
    }
    return merged.slice(0, limit)
}

// ─── Utilities ──────────────────────────────────────────────────────────────

const fetchWithTimeout = async (url, ms = 7000) => {
    try {
        const c = new AbortController()
        setTimeout(() => c.abort(), ms)
        const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }, redirect: 'follow' })
        return r.ok ? await r.text() : null
    } catch {
        return null
    }
}

const extractEmails = t => {
    const m = [...t.matchAll(/href="mailto:([^"?]+)"/g)].map(x => x[1])
    const r = [...new Set([...(t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []), ...m])]
    return r.filter(e => e.length < 40 && !/noreply|example|wix|sentry|test@|no-reply|donotreply/i.test(e))
}

const classifyEmails = async (emails, domain, runId, entropy) => {
    try {
        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}

Classify business emails for ${domain}.
Return JSON [{address,category,confidence}].
Categories: HR, Sales, Support, Marketing, Management, Technical, Info, General

Emails:${JSON.stringify(emails)}
`,
            `cls-${Date.now()}-${entropy}`,
            () => { },
            "You classify emails into business categories."
        )
        const p = JSON.parse(raw.replace(/```json|```/g, '').trim())
        return Array.isArray(p) ? p : []
    } catch {
        return emails.map(e => ({ address: e, category: heuristicRole(e), confidence: 0.7 }))
    }
}

const heuristicRole = e => /hr|career|recruit|talent/i.test(e) ? 'HR/Recruiter' : /sales|marketing/i.test(e) ? 'Sales' : /support|help/i.test(e) ? 'Support' : 'Info'
const shuffle = a => a.sort(() => Math.random() - 0.5)
const isValidUrl = u => { try { new URL(u); return true } catch { return false } }

const isBlocklisted = u => ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'x.com', 'tiktok.com'].some(b => u.includes(b))
const isSearchBlocklisted = u => ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'x.com', 'tiktok.com'].some(b => u.includes(b))

const deduplicateUrls = (urls) => {
    const seen = new Set()
    return urls.filter(u => {
        if (seen.has(u)) return false
        seen.add(u)
        return true
    })
}

const getCountryName = c => ({
    us: 'United States', gb: 'United Kingdom', ca: 'Canada', de: 'Germany', fr: 'France',
    au: 'Australia', es: 'Spain', it: 'Italy', nl: 'Netherlands', br: 'Brazil',
    in: 'India', jp: 'Japan', cn: 'China', ma: 'Morocco', sa: 'Saudi Arabia',
    ae: 'United Arab Emirates', eg: 'Egypt', za: 'South Africa', ng: 'Nigeria',
    ke: 'Kenya', gh: 'Ghana', tn: 'Tunisia', dz: 'Algeria', kr: 'South Korea',
    mx: 'Mexico', ar: 'Argentina', cl: 'Chile', co: 'Colombia', pe: 'Peru',
    se: 'Sweden', no: 'Norway', dk: 'Denmark', fi: 'Finland', pl: 'Poland',
    pt: 'Portugal', be: 'Belgium', at: 'Austria', ch: 'Switzerland', ie: 'Ireland',
    nz: 'New Zealand', sg: 'Singapore', hk: 'Hong Kong', tw: 'Taiwan', th: 'Thailand',
    id: 'Indonesia', my: 'Malaysia', ph: 'Philippines', vn: 'Vietnam', tr: 'Turkey',
    ru: 'Russia', ua: 'Ukraine', ro: 'Romania', cz: 'Czech Republic', hu: 'Hungary',
    il: 'Israel', pk: 'Pakistan', bd: 'Bangladesh', lk: 'Sri Lanka', qa: 'Qatar',
    kw: 'Kuwait', bh: 'Bahrain', om: 'Oman', jo: 'Jordan', lb: 'Lebanon'
}[c?.toLowerCase()] || 'Global')

const getMetaContent = (h, p) => {
    const byProp = h.match(new RegExp(`<meta\\s+property="${p}"\\s+content="([^"]+)"`, 'i'))
    if (byProp) return byProp[1]
    const byName = h.match(new RegExp(`<meta\\s+name="${p}"\\s+content="([^"]+)"`, 'i'))
    return byName ? byName[1] : null
}
const getTitleTag = h => (h.match(/<title>(.*?)<\/title>/i) || [])[1]?.split(/[|-]/)[0]?.trim() || null

const extractSubPageUrls = (baseUrl, html, keywords) => {
    const base = new URL(baseUrl)
    const urls = new Set()
    const linkRx = /<a[^>]+href="([^"#]+)"/gi
    let match
    while ((match = linkRx.exec(html)) !== null) {
        try {
            const href = match[1]
            const full = href.startsWith('http') ? href : new URL(href, base.origin).href
            const fullUrl = new URL(full)
            if (fullUrl.hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) continue
            const path = fullUrl.pathname.toLowerCase()
            if (keywords.some(kw => path.includes(kw))) {
                urls.add(full)
            }
        } catch { }
    }
    return [...urls]
}

const extractRecruiterEmails = (html) => {
    const allEmails = extractEmails(html)
    const recruiterPatterns = /hr|recruit|talent|career|hiring|people|rh|drh|job|employ|staffing|recrutement|rrhh|personal|embauche/i
    const results = []
    for (const email of allEmails) {
        const localPart = email.split('@')[0]
        if (recruiterPatterns.test(localPart)) {
            results.push({
                address: email,
                role: classifyRecruiterRole(localPart),
                confidence: 0.85
            })
        }
    }
    return results
}

const classifyRecruiterRole = (local) => {
    if (typeof local !== 'string') return 'HR/Recruitment'
    const l = local.toLowerCase()
    if (/drh|director.*hr|hr.*director/i.test(l)) return 'HR Director'
    if (/rrhh|rh|^hr$/i.test(l)) return 'HR Department'
    if (/recruit|recrutement|embauche/i.test(l)) return 'Recruiter'
    if (/talent/i.test(l)) return 'Talent Acquisition'
    if (/career|job|hiring|employ|empleo/i.test(l)) return 'Careers'
    if (/people|personal/i.test(l)) return 'People Team'
    if (/staffing/i.test(l)) return 'Staffing'
    return 'HR/Recruitment'
}

const deduplicateRecruiterEmails = (emails) => {
    const seen = new Set()
    return emails.filter(e => {
        const key = e.address.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

// ─── Recruiter Email Hunting (Enhanced) ─────────────────────────────────────

const deepRecruiterHunt = async (domain, companyName, runId, entropy) => {
    const recruiterEmails = []

    const careerPaths = [
        'careers', 'jobs', 'contact', 'about', 'team', 'join-us', 'hiring'
    ]
    for (const path of careerPaths) {
        const url = `https://${domain}/${path}`
        const html = await fetchWithTimeout(url, 6000)
        if (!html) continue
        const found = extractRecruiterEmails(html)
        recruiterEmails.push(...found)
        const general = extractEmails(html)
        for (const email of general) {
            if (!recruiterEmails.some(r => r.address === email)) {
                const localPart = email.split('@')[0].toLowerCase()
                const companyTld = domain.split('.').slice(-2).join('.')
                if (email.endsWith(`@${domain}`) || email.endsWith(`@${companyTld}`)) {
                    recruiterEmails.push({
                        address: email,
                        role: classifyRecruiterRole(localPart) || 'Career Page Contact',
                        confidence: /hr|recruit|talent|career|hiring|people/i.test(localPart) ? 0.92 : 0.7
                    })
                }
            }
        }
        if (recruiterEmails.length >= 3) break
    }

    if (recruiterEmails.length < 2) {
        const searchQueries = [
            `site:${domain} career contact email HR`,
            `"${companyName}" HR recruiter email contact`
        ]
        for (const query of searchQueries) {
            if (recruiterEmails.length >= 3) break
            const urls = await performWebSearch(query, 6)
            for (const u of urls) {
                try {
                    if (new URL(u).hostname.replace(/^www\./, '') !== domain) continue
                } catch { continue }
                const html = await fetchWithTimeout(u, 8000)
                if (!html) continue
                recruiterEmails.push(...extractRecruiterEmails(html))
            }
        }
    }

    if (recruiterEmails.length < 2) {
        const linkedInQueries = [
            `site:linkedin.com/in/ "${companyName}" recruiter OR "talent acquisition" OR HR`,
        ]
        for (const query of linkedInQueries) {
            const urls = await performWebSearch(query, 5)
            for (const url of urls.slice(0, 3)) {
                if (!url.includes('linkedin.com/in/')) continue
                const html = await fetchWithTimeout(url, 10000)
                if (!html) continue
                const profileData = extractLinkedInPublicData(html, url)
                if (profileData.name && /recruiter|talent|hr|hiring|people/i.test(profileData.headline || '')) {
                    const derivedEmails = await deriveEmailsFromProfile({ ...profileData, companyDomain: domain }, runId, entropy)
                    for (const de of derivedEmails) {
                        if (de.address.includes(domain)) {
                            recruiterEmails.push({
                                address: de.address,
                                role: de.role || classifyRecruiterRole(profileData.headline || ''),
                                confidence: de.confidence * 0.85,
                                source: 'linkedin-derived',
                                derivedFrom: profileData.name
                            })
                        }
                    }
                }
            }
        }
    }

    if (recruiterEmails.length === 0) {
        try {
            const guessed = await generateText(
                `
RunID:${runId}
Entropy:${entropy}

Company: ${companyName}
Domain: ${domain}

Based on standard business email conventions, what are the most likely recruiter/HR email addresses for this company?
Common patterns: hr@domain, careers@domain, recruitment@domain, talent@domain, jobs@domain, rh@domain
Consider the company name and domain format.

ONLY suggest emails that follow real business conventions.
Return JSON array: [{address, role, confidence}]
Confidence must reflect how likely the email truly exists (0.5-0.8 range only).
If the domain seems personal or small, return [].
Max 3 suggestions.
`,
                `recr-${Date.now()}-${entropy}`,
                () => { },
                "You predict business email patterns with conservative confidence scoring."
            )
            const parsed = JSON.parse(guessed.replace(/```json|```/g, '').trim())
            if (Array.isArray(parsed)) {
                for (const e of parsed) {
                    if (e.address && e.confidence >= 0.5 && e.address.includes('@')) {
                        recruiterEmails.push({
                            address: e.address,
                            role: e.role || 'Predicted HR',
                            confidence: Math.min(e.confidence, 0.75),
                            predicted: true
                        })
                    }
                }
            }
        } catch { }
    }

    return deduplicateRecruiterEmails(recruiterEmails)
}

const verifyAndRankRecruiterEmails = async (emails, domain, runId, entropy) => {
    if (!emails.length) return []

    const companyTld = domain.split('.').slice(-2).join('.')
    const ranked = emails.map(e => {
        let boost = 0
        if (e.address.endsWith(`@${domain}`) || e.address.endsWith(`@${companyTld}`)) boost += 0.1
        if (/^(hr|recruit|talent|career|rh|drh)@/i.test(e.address)) boost += 0.08
        if (e.predicted) boost -= 0.15
        if (e.source === 'linkedin-derived') boost += 0.05
        return {
            ...e,
            confidence: Math.min(Math.max(e.confidence + boost, 0.1), 0.99)
        }
    })

    try {
        const raw = await generateText(
            `
RunID:${runId}
Entropy:${entropy}

Domain: ${domain}
Recruiter emails found: ${JSON.stringify(ranked.map(e => ({ address: e.address, role: e.role, confidence: e.confidence, predicted: !!e.predicted, source: e.source || 'direct' })))}

Evaluate each email:
1. Does the email pattern match standard business conventions for this domain?
2. Is the role classification accurate?
3. Adjust confidence: increase for likely real emails, decrease for suspicious ones.

Return JSON array: [{address, role, confidence, verified: true/false}]
Only mark verified:true if the email follows a highly likely real pattern.
`,
            `verify-${Date.now()}-${entropy}`,
            () => { },
            "You verify and rank business email addresses for quality."
        )
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
        if (Array.isArray(parsed) && parsed.length) {
            return parsed
                .filter(e => e.address && e.confidence > 0.3)
                .sort((a, b) => b.confidence - a.confidence)
        }
    } catch { }

    return ranked.sort((a, b) => b.confidence - a.confidence)
}

// ─── Exports ────────────────────────────────────────────────────────────────

export {
    processSearchWithAI,
    performWebSearch,
    performGlobalSearch,
    processWebResult,
    classifyEmails,
    deepRecruiterHunt,
    verifyAndRankRecruiterEmails
}