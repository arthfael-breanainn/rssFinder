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

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const fs = require('fs');
const _ = require('lodash');
const rssFinder = require('./rssFinder');
const response = require('../_testsAssets/response.json');
const links = require('../_testsAssets/links.json');
const urls = require('../_testsAssets/urls.json');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('module dataCrawler : rssFinder', () => {
  it('should have a function fetchAllLinks', () => {
    expect(rssFinder.fetchAllLinks).to.exist;
    expect(typeof rssFinder.fetchAllLinks).to.equal('function');
  });

  it('should have a function keepSameRootDomainLink', () => {
    expect(rssFinder.keepSameRootDomainLink).to.exist;
    expect(typeof rssFinder.keepSameRootDomainLink).to.equal('function');
  });

  it('should have a function fetchAllRss', () => {
    expect(rssFinder.fetchAllRss).to.exist;
    expect(typeof rssFinder.fetchAllRss).to.equal('function');
  });

  it('should have a function keepOnlyRssUrl', () => {
    expect(rssFinder.keepOnlyRssUrl).to.exist;
    expect(typeof rssFinder.keepOnlyRssUrl).to.equal('function');
  });

  describe('fetchAllLinks :', () => {
    let rssFinderWithStubs;
    let request;

    beforeEach(() => {
      request = sinon.stub().yields();
      rssFinderWithStubs = proxyquire('./rssFinder', {
        request,
      });
    });

    it('should fail if url is not a string', (done) => {
      rssFinderWithStubs.fetchAllLinks({})
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/.+is not a valid url$/);
          done();
        })
        .catch(done);
    });

    it('should fail if url is empty', (done) => {
      rssFinderWithStubs.fetchAllLinks('')
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/.+is not a valid url$/);
          done();
        })
        .catch(done);
    });

    it('should fail if url is corrupted', (done) => {
      request.yields(new Error('test fail lib request'), null, null);
      rssFinderWithStubs.fetchAllLinks('https://www.test.unavailable.url.com/')
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^test fail lib request$/);
          done();
        })
        .catch(done);
    });

    it('should fail if response is not equal 200', (done) => {
      request.yields(null, { statusCode: 404, statusMessage: 'test not found' }, null);
      rssFinderWithStubs.fetchAllLinks('https://www.test.unavailable.url.com/')
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/.*: 404 test not found$/);
          done();
        })
        .catch(done);
    });

    it('should fail if body is not a string', (done) => {
      request.yields(null, { statusCode: 200, statusMessage: 'test non-string body' }, null);
      rssFinderWithStubs.fetchAllLinks('https://www.test.available.but.unexpected.body.com/')
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/.*: body response is not a string$/);
          done();
        })
        .catch(done);
    });

    it('should succeeded even if body is empty', (done) => {
      request.yields(null, { statusCode: 200, statusMessage: 'test empty body' }, '');
      rssFinderWithStubs.fetchAllLinks('https://www.test.available.but.empty.body.com/')
        .then((data) => {
          expect(data).to.deep.equal([]);
          done();
        })
        .catch(err => done(new Error(`should not have failed : ${err}`)));
    });

    it('should succeeded', (done) => {
      request.yields(null, response, fs.readFileSync('./_testsAssets/body.txt', 'utf8'));
      rssFinderWithStubs.fetchAllLinks('https://www.test.available.url.com/')
        .then((data) => {
          expect(data).to.deep.equal(links);
          done();
        })
        .catch(err => done(new Error(`should not have failed : ${err}`)));
    });
  });

  describe('keepSameRootDomainLink :', () => {
    it('should fail if rootUrl is not a string', (done) => {
      rssFinder.keepSameRootDomainLink(null, links)
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^Invalid params in keepSameRootDomainLink$/);
          done();
        })
        .catch(done);
    });

    it('should fail if rootUrl is an empty string', (done) => {
      rssFinder.keepSameRootDomainLink('', links)
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^No rootUrl to process in keepSameRootDomainLink$/);
          done();
        })
        .catch(done);
    });

    it('should fail if urls is not an array', (done) => {
      rssFinder.keepSameRootDomainLink('https://www.test.available.url.com/', null)
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^Invalid params in keepSameRootDomainLink$/);
          done();
        })
        .catch(done);
    });

    it('should fail if urls is an empty array', (done) => {
      rssFinder.keepSameRootDomainLink('https://www.test.available.url.com/', [])
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^No urls to process in keepSameRootDomainLink$/);
          done();
        })
        .catch(done);
    });

    it('should succeeded even if urls is an array fill with misformated links', (done) => {
      rssFinder.keepSameRootDomainLink('https://www.test.available.url.com/', [null, '', {}, 2, []])
        .then((data) => {
          expect(data).to.deep.equal([]);
          done();
        })
        .catch(err => done(new Error(`should not have failed : ${err}`)));
    });

    it('should succeeded', (done) => {
      // clone links array to test absolutes / relatives links
      const testLinks = _.cloneDeep(links);
      testLinks[testLinks.length - 1] = `https://www.test.available.url.com${testLinks[testLinks.length - 1]}`;
      rssFinder.keepSameRootDomainLink('https://www.test.available.url.com/', testLinks)
        .then((data) => {
          expect(data).to.deep.equal(urls);
          done();
        })
        .catch(err => done(new Error(`should not have failed : ${err}`)));
    });
  });

  describe('fetchAllRss :', () => {
    let rssFinderWithStubs;
    let stubRssFinder;

    beforeEach(() => {
      stubRssFinder = sinon.stub();
      rssFinderWithStubs = proxyquire('./rssFinder', {
        'rss-finder': stubRssFinder,
      });
    });

    it('should fail if rss-finder lib reject', (done) => {
      stubRssFinder.rejects(new Error('test error rss-finder lib'));
      rssFinderWithStubs.keepOnlyRssUrl(rssFinderWithStubs.fetchAllRss, ['https://www.test.available.url.com/'])
        .then((data) => {
          expect(data).to.be.an('object');
          expect(data.allRss).to.be.an('array').to.have.lengthOf(0);
          expect(data.allErrors).to.be.an('array').to.have.lengthOf(1);
          expect(data.allErrors[0]).to.be.an('Error');
          expect(data.allErrors[0].message).to.be.equal('test error rss-finder lib');
          done();
        })
        .catch(err => done(new Error(`should not have failed : ${err}`)));
    });

    it('should succeeded', (done) => {
      stubRssFinder.resolves({
        site: {
          title: 'Le Monde.fr - Actualit&eacute;s et Infos en France et dans le monde',
          favicon: 'https://s1.lemde.fr/medias/web/1.2.707/ico/favicon.ico',
          url: 'https://www.lemonde.fr'
        },
        feedUrls: [
          {
            title: 'Le Monde.fr : A la une',
            url: 'https://www.lemonde.fr/rss/une.xml'
          }
        ]
      });
      rssFinderWithStubs.keepOnlyRssUrl(rssFinderWithStubs.fetchAllRss, ['https://www.test.available.url.com/'])
        .then((data) => {
          expect(data).to.be.an('object');
          expect(data.allRss).to.be.an('array').to.deep.equal(['https://www.lemonde.fr/rss/une.xml']);
          expect(data.allErrors).to.be.an('array').to.have.lengthOf(0);
          done();
        })
        .catch(err => done(new Error(`should not have failed : ${err}`)));
    });
  });

  describe('keepOnlyRssUrl :', () => {
    let rssFinderWithStubs;
    let stubRssFinder;

    beforeEach(() => {
      stubRssFinder = sinon.stub();
      rssFinderWithStubs = proxyquire('./rssFinder', {
        'rss-finder': stubRssFinder,
      });
    });

    it('should fail if generator is falsy', (done) => {
      rssFinderWithStubs.keepOnlyRssUrl(null, ['https://www.test.available.url.com/'])
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^Invalid params in keepOnlyRssUrl$/);
          done();
        })
        .catch(done);
    });

    it('should fail if generator is not a function', (done) => {
      rssFinderWithStubs.keepOnlyRssUrl([], ['https://www.test.available.url.com/'])
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^Invalid params in keepOnlyRssUrl$/);
          done();
        })
        .catch(done);
    });

    it('should fail if websiteUrls is not an array', (done) => {
      rssFinderWithStubs.keepOnlyRssUrl(rssFinderWithStubs.fetchAllRss, {})
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^Invalid params in keepOnlyRssUrl$/);
          done();
        })
        .catch(done);
    });

    it('should fail if websiteUrls is an empty array', (done) => {
      rssFinderWithStubs.keepOnlyRssUrl(rssFinderWithStubs.fetchAllRss, [])
        .then(() => {
          done(new Error('should not have succeeded'));
        })
        .catch((err) => {
          expect(err.message).to.match(/^No urls for extract rss feeds$/);
          done();
        })
        .catch(done);
    });

    it('should succeeded', (done) => {
      stubRssFinder.resolves({
        site: {
          title: 'Le Monde.fr - Actualit&eacute;s et Infos en France et dans le monde',
          favicon: 'https://s1.lemde.fr/medias/web/1.2.707/ico/favicon.ico',
          url: 'https://www.lemonde.fr'
        },
        feedUrls: [
          {
            title: 'Le Monde.fr : A la une',
            url: 'https://www.lemonde.fr/rss/une.xml'
          }
        ]
      });
      rssFinderWithStubs.keepOnlyRssUrl(rssFinderWithStubs.fetchAllRss, ['https://www.test.available.url.com/', 'https://www.test.available.url.com/'])
        .then((data) => {
          expect(data).to.be.an('object');
          expect(data.allRss).to.be.an('array').to.deep.equal(['https://www.lemonde.fr/rss/une.xml', 'https://www.lemonde.fr/rss/une.xml']);
          expect(data.allErrors).to.be.an('array').to.have.lengthOf(0);
          done();
        })
        .catch(err => done(new Error(`should not have failed : ${err}`)));
    });
  });
});
