// Generated from supplied 5ch userscripts; source maintained locally.
const BROWSER="function fivechBrowser(config) {\n  'use strict';\n  const scope = /^https:\\/\\/(?:itest\\.5ch\\.io\\/subback\\/[^/?#]+(?:\\/[^?#]*)?|(?:itest\\.5ch\\.io\\/[^/?#]+|(?:[a-z0-9-]+\\.)+5ch\\.io)\\/test\\/read\\.cgi\\/[^/?#]+\\/[0-9]+(?:\\/[^?#]*)?)(?:\\?[^#]*)?(?:#.*)?$/i;\n  if (!scope.test(location.href)) return;\n  const key = Symbol.for('loon.5ch.reading.v1');\n  if (window[key]) return;\n  window[key] = true;\n\n  if (config.force_latest && location.hostname === 'itest.5ch.io') {\n    const match = location.pathname.match(/^\\/([^/]+)\\/test\\/read\\.cgi\\/([^/]+)\\/(\\d+)\\/?$/);\n    if (match) {\n      location.replace(location.origin + '/' + match[1] + '/test/read.cgi/' + match[2] + '/' + match[3] + '/l-' + location.search + location.hash);\n      return;\n    }\n  }\n  if (!config.filter_spam && !config.block_symbol && !config.remove_ads) return;\n\n  // Observed on unfiltered itest list/thread pages; never match ordinary post classes.\n  const adSelector = '.fun_ad_subback,.res_ad,.ad_nth,.ad_nth_li,.ad_5ch_works,.ad_300x250_maintap,#creative-player,#browsifixedatf,#instant_ad,#js-wipe-banner,#js-interstitial,div[id^=\"subback-ad-\"],div[id$=\"-300x250\"],[class*=\"js-ads-content-top_\"],[id^=\"browsi_adWrapper_\"],[id^=\"browsi_adContainer_\"],div[id^=\"hideme\"]';\n  if (config.remove_ads) {\n    const style = document.createElement('style');\n    style.textContent = adSelector + '{display:none!important}.bbsmenu-with-ad{padding-bottom:0!important}#js-forms{height:auto!important}div[itemprop=\"itemListElement\"][style*=\"margin-top: 100px\"]{margin-top:0!important}';\n    (document.head || document.documentElement).appendChild(style);\n  }\n  function cleanAds() {\n    if (!config.remove_ads) return;\n    document.querySelectorAll(adSelector).forEach(node => node.remove());\n    // MicroAd uses a 32-hex placement ID; avoid generic AD_* or all iframe rules.\n    document.querySelectorAll('div[id^=\"AD_\"]').forEach(node => {\n      if (/^AD_[a-f0-9]{32}_\\d+$/i.test(node.id) && node.querySelector('iframe')) node.remove();\n    });\n    document.querySelectorAll('iframe').forEach(frame => {\n      const src = frame.getAttribute('src') || '';\n      if (!frame.hasAttribute('data-ad_code') && !/^(?:https:\\/\\/itest\\.5ch\\.io)?\\/kn\\/widget\\?/.test(src)) return;\n      const parent = frame.parentElement;\n      if (parent && parent.tagName === 'DIV' && parent.children.length === 1) parent.remove();\n      else if (parent && parent.tagName === 'LI' && !parent.querySelector('a.subback_link,.threadview_response_body')) parent.remove();\n      else frame.remove();\n    });\n  }\n\n  const postSelector = 'li.threadview_response, div.post';\n  const bodySelector = '.threadview_response_body, .post-content';\n  const duplicateKeyByPost = new WeakMap();\n  const blockedDuplicateKeys = new Set();\n  const upperRun = /[A-Z]{80,}/;\n  let timer = null;\n  function textOf(body) { return body.innerText || body.textContent || ''; }\n  function duplicateKey(post, body) {\n    if (!duplicateKeyByPost.has(post)) {\n      const copy = body.cloneNode(true);\n      copy.querySelectorAll('a.threadview_response_body_link-anchor, a.reply_link').forEach(link => link.remove());\n      duplicateKeyByPost.set(post, textOf(copy).replace(/\\s+/g, '').trim());\n    }\n    return duplicateKeyByPost.get(post);\n  }\n  function isUpperSpam(raw, body) {\n    const text = raw.replace(/\\s+/g, '').replace(/[\\uff21-\\uff3a\\uff41-\\uff5a]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));\n    if (text.length < 200) return false;\n    const upper = (text.match(/[A-Z]/g) || []).length;\n    const japanese = (text.match(/[\\u3040-\\u30ff\\u3400-\\u9fff]/g) || []).length;\n    return japanese <= 2 && upper / text.length >= 0.80 && (body.querySelectorAll('br').length >= 5 || upperRun.test(text));\n  }\n  function scan() {\n    timer = null;\n    cleanAds();\n    if (!config.filter_spam && !config.block_symbol) return;\n    const entries = [], counts = new Map();\n    document.querySelectorAll(postSelector).forEach(post => {\n      const body = post.querySelector(bodySelector);\n      if (!body) return;\n      const duplicate = config.filter_spam ? duplicateKey(post, body) : '';\n      entries.push({ post, body, duplicate });\n      if (duplicate) counts.set(duplicate, (counts.get(duplicate) || 0) + 1);\n    });\n    counts.forEach((count, duplicate) => { if (count > 5) blockedDuplicateKeys.add(duplicate); });\n    entries.forEach(({ post, body, duplicate }) => {\n      const raw = textOf(body);\n      if ((config.block_symbol && raw.includes('\\u25c6')) || (config.filter_spam && ((duplicate && blockedDuplicateKeys.has(duplicate)) || isUpperSpam(raw, body)))) post.remove();\n    });\n  }\n  function start() {\n    scan();\n    const observer = new MutationObserver(records => {\n      let changed = false;\n      for (const record of records) {\n        const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;\n        const post = element && element.closest(postSelector);\n        if (post) { duplicateKeyByPost.delete(post); changed = true; }\n        if (config.remove_ads && record.type === 'attributes' && element && (element.matches(adSelector+',iframe,div[id^=\"AD_\"]'))) changed = true;\n        if (record.type === 'childList') {\n          for (const node of record.addedNodes) {\n            if (node.nodeType === 1 && (node.matches(postSelector) || node.querySelector(postSelector))) changed = true;\n            if (config.remove_ads && node.nodeType === 1 && (node.matches(adSelector+',iframe,div[id^=\"AD_\"]') || node.querySelector(adSelector+',iframe,div[id^=\"AD_\"]'))) changed = true;\n          }\n        }\n      }\n      // Ignore unrelated ads/menus and our own removals. Debounce only actual post updates.\n      if (changed) { clearTimeout(timer); timer = setTimeout(scan, 200); }\n    });\n    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, ...(config.remove_ads ? { attributes:true, attributeFilter:['class','id','src','data-ad_code'] } : {}) });\n  }\n  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });\n  else start();\n}";
const HASHES={"0000":"D6xYozIyfEyN6SEurnD7uBplMOAuFDg5PNa7a35jZd8=","0001":"qD7LlICt8Zd9dTOFVdhhy3s6/4cb1pF12hiM6ySS0AA=","0010":"6ucrr5gsgg4/BKOyOZtYVHcXiRkGnnuKjBIeLHFZC4I=","0011":"FMFzMn3yLfMJFyTpec2OIuyIyna48+Oy2uofRxw7/ps=","0100":"zppH7ozkwN1EWS7XdpDzV8ogeWAT4y9/AhCY5KXt2/8=","0101":"F6TGvjfuSP8rSyS4f7MMWT8gHj+S5bN5ENNEGbfAeeI=","0110":"YNBHeZ0PNF5IYYPLeVzMR9Z5l+e0q4RhlQVx4AsOeVY=","0111":"aRFaaVQZaaq3F5roNapti38RIuUr514U4IrIEXedbr8=","1000":"m2zOf1kF7qHhJc8yyQD83xWBvirE6JHDxlHe0V1mfmw=","1001":"FsWhsFjVTFSdn1ZL1k6IvRcJp3HGwf0Dm4tyEVm+auw=","1010":"LDukWQa48vm+Xzsl8HYisQgxy0Ua5vSu5JzX3r3vyXM=","1011":"TuKtdW7aHhxRlBt4szajOd2TqGp9dr5zklXKqZpn22U=","1100":"fKgkIpX3EQ2j1KsjgcUV3D091l89xV8X8ozFEj89wp8=","1101":"84CNFuk7yai95DbCgSgRvXU+Rkdjj3DykFoN5pNBORk=","1110":"OHMxtLDLnSSIJF3SaSqmbx/wgSlFKjbfEhUU66wKdRU=","1111":"DFKLnGklX+M4btDqkkaMLi/el+z/eXJ58bD10OD+8+4="};
// BROWSER and HASHES are embedded at build time; no runtime downloads or crypto dependencies.
(() => {
  'use strict';
  try {
    const args = typeof $argument === 'undefined' || $argument == null ? {} : (typeof $argument === 'string' ? JSON.parse($argument) : $argument);
    const config = { force_latest: args.force_latest ?? true, filter_spam: args.filter_spam ?? true, block_symbol: args.block_symbol ?? true, remove_ads: args.remove_ads ?? true };
    const scope = /^https:\/\/(?:itest\.5ch\.io\/subback\/[^/?#]+(?:\/[^?#]*)?|(?:itest\.5ch\.io\/[^/?#]+|(?:[a-z0-9-]+\.)+5ch\.io)\/test\/read\.cgi\/[^/?#]+\/[0-9]+(?:\/[^?#]*)?)(?:\?[^#]*)?$/i;
    const headers = $response.headers || {};
    const headerKey = name => Object.keys(headers).find(key => key.toLowerCase() === name);
    const typeKey = headerKey('content-type');
    if (!scope.test($request.url) || $response.status !== 200 || !/^text\/html(?:\s*;|$)/i.test(headers[typeKey] || '') || typeof $response.body !== 'string' || (!config.filter_spam && !config.block_symbol && !config.remove_ads)) { $done({}); return; }
    let body = $response.body;
    if (/<script\b[^>]*\sdata-loon-5ch\s*=\s*["']1["']/i.test(body)) { $done({}); return; }
    if (config.remove_ads && /^https:\/\/itest\.5ch\.io\//i.test($request.url)) {
      // Remove only known dedicated ad loaders. Keep the application/thumbnailer/Rocket Loader.
      body = body.replace(/<!--[\s\S]*?-->|<script\b(?:"[^"]*"|'[^']*'|[^'">])*?>[\s\S]*?<\/script\s*>/gi, tag => {
        if (tag.startsWith('<!--')) return tag;
        const opening = tag.slice(0, tag.indexOf('>') + 1);
        const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(opening);
        if (src && /^(?:https?:)?\/\/(?:cdn\.browsiprod\.com\/|j\.microad\.net\/js\/compass\.js|cdn\.microad\.jp\/compass\/|(?:static-)?rise\.enhance\.co\.jp\/|cdn-guile\.akamaized\.net\/interstitial\/ad\/|girls-escort\.tokyo\/loader\.min\.js)/i.test(src[1])) return '';
        if (src && /^(?:https:\/\/itest\.5ch\.io)?\/assets\/js\/ad-manager-5ch\.js(?:\?|$)/i.test(src[1])) return '';
        const code = tag.slice(opening.length, tag.lastIndexOf('</'));
        if (!src && (/^\s*var microadCompass\s*=/.test(code) || /^\s*const loadJsFile52\s*=/.test(code) && code.includes('/interstitial/ad/') && !code.includes('App.'))) return '';
        if (!src && /^\s*if\s*\(App\.instances\.blacklist\.isNGThread\(\)\)/.test(code) && (code.includes("getElementById('js-wipe-banner')") || code.includes("getElementById('js-interstitial')"))) return '';
        return tag;
      });
    }
    const mask = (config.force_latest ? '1' : '0') + (config.filter_spam ? '1' : '0') + (config.block_symbol ? '1' : '0') + (config.remove_ads ? '1' : '0');
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
