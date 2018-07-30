// MIT License

// Copyright (c) 2018 Laurent Bauchet

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

const rssFinder = require('rss-finder');
const request = require('request');
const cheerio = require('cheerio');
const urlParser = require('url');
const _ = require('lodash');

/**
 * @name fetchAllLinks
 * @description Fetch all link from url
 * @param {String} url
 * @returns {Promise}
 */
const fetchAllLinks = url => new Promise((resolve, reject) => {
  if (typeof url !== 'string' || !url) {
    return reject(new Error(`${url} is not a valid url`));
  }
  return request(url, (err, resp, body) => {
    if (err) return reject(err);
    if (resp.statusCode !== 200) return reject(new Error(`${url} : ${resp.statusCode} ${resp.statusMessage}`));
    if (typeof body !== 'string') return reject(new Error(`${url} : body response is not a string`));
    const $$ = cheerio.load(body);
    const links = $$('a');
    let urls = [];
    $$(links)
      .each((i, link) => {
        urls.push(`${$$(link).attr('href')}`);
      });
    urls = urls.filter(link => link);
    return resolve(urls);
  });
});

/**
 * @name keepSameRootDomainLink
 * @description Filter all links from rootUrl
 * @param {String} rootUrl
 * @param {Array} urls
 * @returns {Promise}
 */
const keepSameRootDomainLink = (rootUrl, urls) => new Promise((resolve, reject) => {
  if (!Array.isArray(urls) || typeof rootUrl !== 'string') return reject(new Error('Invalid params in keepSameRootDomainLink'));
  if (!rootUrl) return reject(new Error('No rootUrl to process in keepSameRootDomainLink'));
  if (urls.length <= 0) return reject(new Error('No urls to process in keepSameRootDomainLink'));
  const OriginalUrlParsing = urlParser.parse(rootUrl);
  const OriginalDomain = OriginalUrlParsing.hostname;
  return resolve(urls
    .filter(url => (
      typeof url === 'string'
      && url
      && (!urlParser.parse(url).hostname
        || (urlParser.parse(url).hostname
          && urlParser.parse(url).hostname === OriginalDomain
        )
      )
    ))
    .map((url) => {
      const urlParsing = urlParser.parse(url);
      if (!urlParsing.hostname) {
        return `${OriginalUrlParsing.protocol}//${`${OriginalDomain}/${url}`.replace(/\/{2,}/, '/')}`;
      }
      return url;
    }));
});

/**
 * @name fetchAllRss
 * @description Found all RSS feeds for each url into urls
 * @param {Array} urls
 * @returns {IterableIterator}
 */
function* fetchAllRss(urls) {
  for (let i = urls.length - 1; i >= 0; i -= 1) {
    yield rssFinder(urls[i]);
  }
}

/**
 * @name keepOnlyRssUrl
 * @description Extract all RSS feeds from data
 * @param {Function} generator
 * @param {Array} websiteUrls
 */
const keepOnlyRssUrl = (generator, websiteUrls) => {
  if (!generator || typeof generator !== 'function' || !Array.isArray(websiteUrls)) return Promise.reject(new Error('Invalid params in keepOnlyRssUrl'));
  if (websiteUrls.length <= 0) return Promise.reject(new Error('No urls for extract rss feeds'));
  const allRss = [];
  const allErrors = [];
  const iterator = generator(websiteUrls);
  const loop = (result) => {
    if (!result.done) {
      return result.value
        .then(
          (res) => {
            allRss.push(res.feedUrls.map(o => o.url));
            return loop(iterator.next());
          }
        )
        .catch((err) => {
          allErrors.push(err);
          // return loop(iterator.trow(err));
          // We do not stop the loop when an error appear
          return loop(iterator.next());
        });
    }
    return Promise.resolve({ allRss: _.flattenDeep(allRss), allErrors });
  };
  return loop(iterator.next());
};

module.exports = {
  fetchAllLinks,
  keepSameRootDomainLink,
  fetchAllRss,
  keepOnlyRssUrl
};
