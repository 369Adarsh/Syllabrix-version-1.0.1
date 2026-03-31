'use strict';
/**
 * web-content.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches open-access educational content from free public APIs to enrich
 * AI prompts. All sources used are free, require no API key, and are
 * legal to use for educational purposes.
 *
 * Sources:
 *   1. Wikipedia REST API   — factual summaries, definitions, overviews
 *   2. arXiv API            — research papers (CS, Math, Physics, Engineering)
 *   3. Open Library API     — book metadata + table of contents
 *   4. DuckDuckGo Instant   — quick factual lookups
 *
 * All fetches have timeouts and gracefully return null on failure so the
 * main AI pipeline never blocks.
 */

const https = require('https');
const http  = require('http');

const TIMEOUT_MS = 5000;

// ─── Generic HTTPS GET ─────────────────────────────────────────────────────

function httpsGet(url, options = {}) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Syllabrix-Education-Platform/1.0 (education; contact@syllabrix.com)',
        'Accept': 'application/json',
        ...options.headers,
      },
      timeout: TIMEOUT_MS,
    }, (res) => {
      // Follow redirects (max 2)
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && !options._redirected) {
        return resolve(httpsGet(res.headers.location, { ...options, _redirected: true }));
      }
      if (res.statusCode !== 200) return resolve(null);
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; if (data.length > 50000) req.destroy(); });
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

// ─── 1. Wikipedia ──────────────────────────────────────────────────────────

/**
 * Fetch Wikipedia page summary for a topic.
 * Returns a plain-text extract (up to ~500 words) or null.
 */
async function fetchWikipediaSummary(topic) {
  if (!topic) return null;
  try {
    const slug = encodeURIComponent(topic.trim().replace(/\s+/g, '_'));
    const raw  = await httpsGet(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
    if (!raw) return null;
    const json = JSON.parse(raw);
    // Discard disambiguation pages
    if (json.type === 'disambiguation') return null;
    return json.extract ? json.extract.slice(0, 800) : null;
  } catch {
    return null;
  }
}

/**
 * Search Wikipedia for the best matching article and return its summary.
 * Falls back gracefully if nothing is found.
 */
async function searchWikipedia(query) {
  if (!query) return null;
  try {
    const encoded = encodeURIComponent(query);
    const raw = await httpsGet(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&utf8=&format=json&srlimit=1`
    );
    if (!raw) return null;
    const json    = JSON.parse(raw);
    const results = json?.query?.search;
    if (!results?.length) return null;
    // Fetch summary for the top result
    return fetchWikipediaSummary(results[0].title);
  } catch {
    return null;
  }
}

/**
 * Fetch an image url (preferably a SVG diagram or illustration) from Wikimedia Commons
 * related to the topic.
 */
async function fetchWikimediaImage(topic) {
  if (!topic) return null;
  try {
    const encoded = encodeURIComponent(topic + " diagram OR illustration OR sketch OR cross section");
    const raw = await httpsGet(
      `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&generator=search&gsrsearch=${encoded}&gsrlimit=3&pithumbsize=800&format=json&utf8=`
    );
    if (!raw) return null;
    const json = JSON.parse(raw);
    const pages = json?.query?.pages;
    if (!pages) return null;
    
    // Get the first result with a thumbnail
    for (const key of Object.keys(pages)) {
      if (pages[key].thumbnail && pages[key].thumbnail.source) {
        return pages[key].thumbnail.source;
      }
    }
    
    // Fallback without "diagram" keywords if none found
    const encodedFallback = encodeURIComponent(topic);
    const rawFallback = await httpsGet(
      `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&generator=search&gsrsearch=${encodedFallback}&gsrlimit=1&pithumbsize=800&format=json&utf8=`
    );
    const jsonFb = JSON.parse(rawFallback || '{}');
    const pagesFb = jsonFb?.query?.pages;
    if (!pagesFb) return null;
    const fbKey = Object.keys(pagesFb)[0];
    return pagesFb[fbKey]?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

// ─── 2. arXiv ─────────────────────────────────────────────────────────────

/**
 * Search arXiv for papers relevant to a CS/Math/Engineering topic.
 * Returns an array of { title, authors, summary, link } (max 2 results) or [].
 * Used to inject cutting-edge research context for advanced questions.
 */
async function searchArXiv(query, maxResults = 2) {
  if (!query) return [];
  try {
    const encoded = encodeURIComponent(query);
    const raw = await httpsGet(
      `https://export.arxiv.org/api/query?search_query=ti:${encoded}&max_results=${maxResults}&sortBy=relevance`
    );
    if (!raw) return [];
    // Parse Atom XML minimally
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(raw)) !== null) {
      const block = match[1];
      const title   = (/<title>([\s\S]*?)<\/title>/.exec(block)?.[1] || '').trim().replace(/\s+/g, ' ');
      const summary = (/<summary>([\s\S]*?)<\/summary>/.exec(block)?.[1] || '').trim().slice(0, 300);
      const link    = /<id>(.*?)<\/id>/.exec(block)?.[1]?.trim() || '';
      const authMatches = [...block.matchAll(/<name>(.*?)<\/name>/g)];
      const authors = authMatches.map(m => m[1]).slice(0, 3).join(', ');
      if (title && summary) entries.push({ title, authors, summary, link });
    }
    return entries;
  } catch {
    return [];
  }
}

// ─── 3. Open Library ──────────────────────────────────────────────────────

/**
 * Search Open Library for a book and return basic metadata.
 * Used to enrich book context for books not in our DB.
 */
async function searchOpenLibraryBook(title, author = '') {
  if (!title) return null;
  try {
    const q = encodeURIComponent(`${title} ${author}`.trim());
    const raw = await httpsGet(`https://openlibrary.org/search.json?q=${q}&limit=1&fields=key,title,author_name,first_publish_year,subject`);
    if (!raw) return null;
    const json = JSON.parse(raw);
    const doc  = json?.docs?.[0];
    if (!doc) return null;
    return {
      title:   doc.title,
      authors: doc.author_name?.slice(0, 2).join(', '),
      year:    doc.first_publish_year,
      subjects: doc.subject?.slice(0, 5) || [],
    };
  } catch {
    return null;
  }
}

// ─── 4. Compound enrichment ───────────────────────────────────────────────

/**
 * Given a topic name and question type, fetch the best combination of
 * open-access content to inject into the AI prompt.
 *
 * Returns { wikiSummary, papers } — both may be null/empty.
 * Fetches run in parallel with individual timeouts so total wait ≤ TIMEOUT_MS.
 */
async function enrichContext({ topic, subject, questionType, isAdvanced = false }) {
  const fetches = [];

  // Wikipedia: always useful for explanations, definitions, comparisons
  if (topic) {
    fetches.push(
      searchWikipedia(`${topic} ${subject || ''}`.trim()).catch(() => null)
    );
  } else {
    fetches.push(Promise.resolve(null));
  }

  // arXiv: only for advanced CS/Math/Engineering questions or research-type queries
  const wantsResearch = isAdvanced || /\b(research|paper|survey|state.of.the.art|recent|novel|deep.learning|neural|transformer|llm|gpt)\b/i.test(topic || '');
  if (wantsResearch && subject) {
    const arxivQuery = topic ? `${topic} ${subject}` : subject;
    fetches.push(searchArXiv(arxivQuery, 2).catch(() => []));
  } else {
    fetches.push(Promise.resolve([]));
  }

  const [wikiSummary, papers] = await Promise.all(fetches);
  return { wikiSummary, papers: papers || [] };
}

// ─── 5. NCERT context wrapper ─────────────────────────────────────────────────

/**
 * Convenience re-export so callers only need to import from web-content.service.
 * Avoids circular deps (ncert-extractor imports httpsGet from here).
 */
function fetchNCERTContext(grade, subject, chapterName) {
  // Lazy-require to prevent circular reference at module load time
  const ncert = require('./ncert-extractor.service');
  return ncert.getChapterContext(grade, subject, chapterName);
}

module.exports = {
  fetchWikipediaSummary, searchWikipedia, searchArXiv,
  searchOpenLibraryBook, enrichContext, fetchNCERTContext,
  fetchWikimediaImage
};
