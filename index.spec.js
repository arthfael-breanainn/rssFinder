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
const index = require('./index');
const rssFinder = require('./rssFinder');
const links = require('./_testsAssets/links.json');
const urls = require('./_testsAssets/urls.json');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('module dataCrawler : index', () => {
  it('should have a function handler', () => {
    expect(index.handler).to.exist;
    expect(typeof index.handler).to.equal('function');
  });

  let stubRssFinderFetchAllLinks;
  let stubRssFinderKeepSameRootDomainLink;
  let stubRssFinderKeepOnlyRssUrl;

  beforeEach(() => {
    stubRssFinderFetchAllLinks = sinon.stub(rssFinder, 'fetchAllLinks').resolves(links);
    stubRssFinderKeepSameRootDomainLink = sinon.stub(rssFinder, 'keepSameRootDomainLink').resolves(urls);
    stubRssFinderKeepOnlyRssUrl = sinon.stub(rssFinder, 'keepOnlyRssUrl').resolves({ allRss: ['https://www.lemonde.fr/rss/une.xml'], allErrors: [], });
  });

  afterEach(() => {
    stubRssFinderFetchAllLinks.restore();
    stubRssFinderKeepSameRootDomainLink.restore();
    stubRssFinderKeepOnlyRssUrl.restore();
  });

  it('should fail if fetchAllLinks reject', (done) => {
    stubRssFinderFetchAllLinks.rejects(new Error('test error fetchAllLinks'));
    index.handler('https://www.test.available.url.com/')
      .then(() => {
        done(new Error('should not have succeeded'));
      })
      .catch((err) => {
        expect(err.message).to.match(/^test error fetchAllLinks$/);
        expect(stubRssFinderFetchAllLinks.calledOnce).to.be.true;
        expect(stubRssFinderFetchAllLinks.firstCall.args).to.have.deep.ordered.members(['https://www.test.available.url.com/']);
        expect(stubRssFinderKeepSameRootDomainLink.called).to.be.false;
        expect(stubRssFinderKeepOnlyRssUrl.called).to.be.false;
        done();
      })
      .catch(done);
  });

  it('should fail if keepSameRootDomainLink reject', (done) => {
    stubRssFinderKeepSameRootDomainLink.rejects(new Error('test error keepSameRootDomainLink'));
    index.handler('https://www.test.available.url.com/')
      .then(() => {
        done(new Error('should not have succeeded'));
      })
      .catch((err) => {
        expect(err.message).to.match(/^test error keepSameRootDomainLink$/);
        expect(stubRssFinderFetchAllLinks.calledOnce).to.be.true;
        expect(stubRssFinderFetchAllLinks.firstCall.args).to.have.deep.ordered.members(['https://www.test.available.url.com/']);
        expect(stubRssFinderKeepSameRootDomainLink.calledOnce).to.be.true;
        expect(stubRssFinderKeepSameRootDomainLink.firstCall.args).to.have.deep.ordered.members(['https://www.test.available.url.com/', links]);
        expect(stubRssFinderKeepOnlyRssUrl.called).to.be.false;
        done();
      })
      .catch(done);
  });

  it('should fail if keepOnlyRssUrl reject', (done) => {
    stubRssFinderKeepOnlyRssUrl.rejects(new Error('test error keepOnlyRssUrl'));
    index.handler('https://www.test.available.url.com/')
      .then(() => {
        done(new Error('should not have succeeded'));
      })
      .catch((err) => {
        expect(err.message).to.match(/^test error keepOnlyRssUrl$/);
        expect(stubRssFinderFetchAllLinks.calledOnce).to.be.true;
        expect(stubRssFinderFetchAllLinks.firstCall.args).to.have.deep.ordered.members(['https://www.test.available.url.com/']);
        expect(stubRssFinderKeepSameRootDomainLink.calledOnce).to.be.true;
        expect(stubRssFinderKeepSameRootDomainLink.firstCall.args).to.have.deep.ordered.members(['https://www.test.available.url.com/', links]);
        expect(stubRssFinderKeepOnlyRssUrl.called).to.be.true;
        expect(stubRssFinderKeepOnlyRssUrl.called).to.be.true;
        expect(stubRssFinderKeepOnlyRssUrl.firstCall.args[1]).to.deep.equal(Array.from(new Set(urls)));
        done();
      })
      .catch(done);
  });

  it('should succeeded', (done) => {
    index.handler('https://www.test.available.url.com/')
      .then((data) => {
        expect(stubRssFinderFetchAllLinks.calledOnce).to.be.true;
        expect(stubRssFinderFetchAllLinks.firstCall.args).to.have.deep.ordered.members(['https://www.test.available.url.com/']);
        expect(stubRssFinderKeepSameRootDomainLink.calledOnce).to.be.true;
        expect(stubRssFinderKeepSameRootDomainLink.firstCall.args).to.have.deep.ordered.members(['https://www.test.available.url.com/', links]);
        expect(stubRssFinderKeepOnlyRssUrl.called).to.be.true;
        expect(stubRssFinderKeepOnlyRssUrl.firstCall.args[1]).to.deep.equal(Array.from(new Set(urls)));
        expect(data).to.be.an('object');
        expect(data.rss).to.be.an('array').to.deep.equal(['https://www.lemonde.fr/rss/une.xml']);
        expect(data.errors).to.be.an('array').to.have.lengthOf(0);
        done();
      })
      .catch(err => done(new Error(`should not have failed : ${err}`)));
  });
});
