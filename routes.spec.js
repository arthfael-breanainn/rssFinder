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
const supertest = require('supertest');
const express = require('express');
const fs = require('fs');
const { appRouter } = require('./routes');
const mainHandler = require('./src/main');

chai.use(chaiAsPromised);
const { expect } = chai;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // need to disable TLS rejection

describe('module dataCrawler : routes', () => {
  it('should have a function appRouter', () => {
    expect(appRouter).to.exist;
    expect(typeof appRouter).to.equal('function');
  });

  let app;
  let request;
  let handler;
  let appRouterWithStubs;

  beforeEach(() => {
    handler = sinon.stub(mainHandler, 'handler');
    app = express();
    appRouterWithStubs = proxyquire('./routes', {
      './src/main': {
        handler,
      },
    });
    appRouterWithStubs.appRouter(app);
    request = supertest(app);
  });

  afterEach(() => {
    handler.restore();
  });

  it('GET should respond with a 500 if params query misformated', (done) => {
    request
      .get('/')
      .expect(500, (err, res) => {
        expect(err).to.not.be.ok;
        expect(res.body).to.deep.equal({});
        done();
      });
  });

  it('GET should respond with a 500 if handler throw an error', (done) => {
    handler.rejects(new Error('test handler error'));
    request
      .get('/?url=https://www.test.fr')
      .expect(500, (err, res) => {
        expect(err).to.not.be.ok;
        expect(res.body).to.deep.equal({});
        done();
      });
  });

  it('should respond with 200', (done) => {
    handler.resolves(fs.readFileSync('./_testsAssets/rssResponse.json', 'utf8'));
    request
      .get('/?url=https://www.test.fr')
      .expect(200, (err, res) => {
        expect(err).to.not.be.ok;
        expect(res.body).to.deep.equal(fs.readFileSync('./_testsAssets/rssResponse.json', 'utf8'));
        done();
      });
  });
});
