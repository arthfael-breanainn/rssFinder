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

const rssFinder = require('./rssFinder');

const handler = url => new Promise((resolve, reject) => {
  console.time('RssSearching');
  rssFinder.fetchAllLinks(url)
    .then(links => rssFinder.keepSameRootDomainLink(url, links))
    .then((urls) => {
      // dedupe urls
      const dedupedUrls = Array.from(new Set(urls));
      return rssFinder.keepOnlyRssUrl(rssFinder.fetchAllRss, dedupedUrls);
    })
    .then((res) => {
      // dedupe RSS
      const allRss = Array.from(new Set(res.allRss));
      console.timeEnd('RssSearching');
      console.log(JSON.stringify({ rss: { count: allRss.length, value: allRss }, errors: { count: res.allErrors.length, value: res.allErrors } }));
      return resolve({ rss: { count: allRss.length, value: allRss }, errors: { count: res.allErrors.length, value: res.allErrors } });
    })
    .catch((e) => {
      console.error('fail', e);
      console.timeEnd('RssSearching');
      return reject(e);
    });
});

module.exports = {
  handler,
};
