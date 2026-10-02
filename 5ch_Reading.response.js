// Generated from supplied 5ch userscripts; source maintained locally.
const BROWSER="function fivechBrowser(config) {\n  'use strict';\n  const scope = /^https:\\/\\/(?:itest\\.5ch\\.io\\/[^/?#]+|(?:[a-z0-9-]+\\.)+5ch\\.io)\\/test\\/read\\.cgi\\/[^/?#]+\\/[0-9]+(?:\\/[^?#]*)?(?:\\?[^#]*)?(?:#.*)?$/i;\n  if (!scope.test(location.href)) return;\n  const key = Symbol.for('loon.5ch.reading.v1');\n  if (window[key]) return;\n  window[key] = true;\n\n  if (config.force_latest && location.hostname === 'itest.5ch.io') {\n    const match = location.pathname.match(/^\\/([^/]+)\\/test\\/read\\.cgi\\/([^/]+)\\/(\\d+)\\/?$/);\n    if (match) {\n      location.replace(location.origin + '/' + match[1] + '/test/read.cgi/' + match[2] + '/' + match[3] + '/l-' + location.search + location.hash);\n      return;\n    }\n  }\n  if (!config.filter_spam && !config.block_symbol) return;\n\n  const postSelector = 'li.threadview_response, div.post';\n  const bodySelector = '.threadview_response_body, .post-content';\n  const duplicateKeyByPost = new WeakMap();\n  const blockedDuplicateKeys = new Set();\n  const upperRun = /[A-Z]{80,}/;\n  let timer = null;\n  function textOf(body) { return body.innerText || body.textContent || ''; }\n  function duplicateKey(post, body) {\n    if (!duplicateKeyByPost.has(post)) {\n      const copy = body.cloneNode(true);\n      copy.querySelectorAll('a.threadview_response_body_link-anchor, a.reply_link').forEach(link => link.remove());\n      duplicateKeyByPost.set(post, textOf(copy).replace(/\\s+/g, '').trim());\n    }\n    return duplicateKeyByPost.get(post);\n  }\n  function isUpperSpam(raw, body) {\n    const text = raw.replace(/\\s+/g, '').replace(/[Ａ-Ｚａ-ｚ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));\n    if (text.length < 200) return false;\n    const upper = (text.match(/[A-Z]/g) || []).length;\n    const japanese = (text.match(/[\\u3040-\\u30ff\\u3400-\\u9fff]/g) || []).length;\n    return japanese <= 2 && upper / text.length >= 0.80 && (body.querySelectorAll('br').length >= 5 || upperRun.test(text));\n  }\n  function scan() {\n    timer = null;\n    const entries = [], counts = new Map();\n    document.querySelectorAll(postSelector).forEach(post => {\n      const body = post.querySelector(bodySelector);\n      if (!body) return;\n      const duplicate = config.filter_spam ? duplicateKey(post, body) : '';\n      entries.push({ post, body, duplicate });\n      if (duplicate) counts.set(duplicate, (counts.get(duplicate) || 0) + 1);\n    });\n    counts.forEach((count, duplicate) => { if (count > 5) blockedDuplicateKeys.add(duplicate); });\n    entries.forEach(({ post, body, duplicate }) => {\n      const raw = textOf(body);\n      if ((config.block_symbol && raw.includes('◆')) || (config.filter_spam && ((duplicate && blockedDuplicateKeys.has(duplicate)) || isUpperSpam(raw, body)))) post.remove();\n    });\n  }\n  function start() {\n    scan();\n    const observer = new MutationObserver(records => {\n      let changed = false;\n      for (const record of records) {\n        const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;\n        const post = element && element.closest(postSelector);\n        if (post) { duplicateKeyByPost.delete(post); changed = true; }\n        if (record.type === 'childList') {\n          for (const node of record.addedNodes) {\n            if (node.nodeType === 1 && (node.matches(postSelector) || node.querySelector(postSelector))) changed = true;\n          }\n        }\n      }\n      // Ignore unrelated ads/menus and our own removals. Debounce only actual post updates.\n      if (changed) { clearTimeout(timer); timer = setTimeout(scan, 200); }\n    });\n    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });\n  }\n  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });\n  else start();\n}";
const HASHES={"000":"SuWAcpbWcJorLYcuscn3+kmujqHs5qqPL7K+diP52KE=","001":"AXzDu4BywsGPSNe0vOO0eI2mEcZmg+Fm5ZsF4bqE0BI=","010":"EwJG2x3VDI9V7blQsARrJthcTytm6qSz7GHTWshXOnk=","011":"7h3+E0CZZHiVJZ+pC0w2UtfWvXZumEL7g6BhTv3tvCY=","100":"mMSmjdQp3Eg6kYHllF4/ZYzpW5d09Q4Tbf7JJLxv8J8=","101":"7rCk9MkxmWIOhobADXHMCiA7rlOc5hmd1B1T4DCl9MA=","110":"pme0ZewdYYi9u2gejNApGyxitPYuB7S4NuThB+vcedU=","111":"XDVU04NdnJXg6wjI8x3595hginoFciDa3G5i72dXUdo="};
// BROWSER and HASHES are embedded at build time; no runtime downloads or crypto dependencies.
(() => {
  'use strict';
  try {
    const args = typeof $argument === 'undefined' || $argument == null ? {} : (typeof $argument === 'string' ? JSON.parse($argument) : $argument);
    const config = { force_latest: args.force_latest ?? true, filter_spam: args.filter_spam ?? true, block_symbol: args.block_symbol ?? true };
    const scope = /^https:\/\/(?:itest\.5ch\.io\/[^/?#]+|(?:[a-z0-9-]+\.)+5ch\.io)\/test\/read\.cgi\/[^/?#]+\/[0-9]+(?:\/[^?#]*)?(?:\?[^#]*)?$/i;
    const headers = $response.headers || {};
    const headerKey = name => Object.keys(headers).find(key => key.toLowerCase() === name);
    const typeKey = headerKey('content-type');
    if (!scope.test($request.url) || $response.status !== 200 || !/^text\/html(?:\s*;|$)/i.test(headers[typeKey] || '') || typeof $response.body !== 'string' || (!config.filter_spam && !config.block_symbol)) { $done({}); return; }
    const body = $response.body;
    if (/<script\b[^>]*\sdata-loon-5ch\s*=\s*["']1["']/i.test(body)) { $done({}); return; }
    const mask = (config.force_latest ? '1' : '0') + (config.filter_spam ? '1' : '0') + (config.block_symbol ? '1' : '0');
    const code = '(' + BROWSER + ')(' + JSON.stringify(config) + ');';
    const hash = "'sha256-" + HASHES[mask] + "'";
    const cspKey = headerKey('content-security-policy');
    const nextHeaders = { ...headers };
    let changedCsp = false;
    if (cspKey) {
      // Authorize exactly our script, leaving non-script policies and existing source lists intact.
      nextHeaders[cspKey] = headers[cspKey].split(',').map(policy => {
        const directives = policy.split(';').map(part => part.trim()).filter(Boolean);
        const tokens = directives.map(part => part.split(/\s+/));
        let index = tokens.findIndex(part => part[0].toLowerCase() === 'script-src-elem');
        if (index < 0) index = tokens.findIndex(part => part[0].toLowerCase() === 'script-src');
        if (index < 0) {
          const fallback = tokens.find(part => part[0].toLowerCase() === 'default-src');
          if (!fallback) return policy;
          tokens.push(['script-src', ...fallback.slice(1)]); index = tokens.length - 1;
        }
        const sources = tokens[index].slice(1);
        // Adding a hash to an unsafe-inline-only policy would disable other inline site scripts.
        if (sources.includes("'unsafe-inline'") && !sources.some(value => /^'(?:nonce-|sha(?:256|384|512)-)/.test(value))) return policy;
        if (sources.includes(hash)) return policy;
        tokens[index] = [tokens[index][0], ...sources.filter(value => value !== "'none'"), hash];
        changedCsp = true;
        return tokens.map(part => part.join(' ')).join('; ');
      }).join(',');
    }
    const script = '<script data-loon-5ch="1">' + code.replace(/<\/script/gi, '<\\/script') + '</script>';
    // Skip comments/raw-text elements when looking for a real opening head tag.
    const tags = /<!--[\s\S]*?-->|<(script|style)\b(?:"[^"]*"|'[^']*'|[^'">])*?>[\s\S]*?<\/\1\s*>|<head\b(?:"[^"]*"|'[^']*'|[^'">])*?>/gi;
    let match, offset = -1;
    while ((match = tags.exec(body))) if (/^<head\b/i.test(match[0])) { offset = match.index + match[0].length; break; }
    if (offset < 0) {
      const doctype = /^\uFEFF?\s*<!doctype\b[^>]*>/i.exec(body);
      offset = doctype ? doctype[0].length : (body.charCodeAt(0) === 0xFEFF ? 1 : 0);
    }
    const result = { body: body.slice(0, offset) + script + body.slice(offset) };
    if (changedCsp) result.headers = nextHeaders;
    $done(result);
  } catch (error) {
    console.log('[5ch Reading] Injection failed: ' + String(error && error.message || error));
    $done({});
  }
})();
