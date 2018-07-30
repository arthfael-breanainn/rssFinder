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

# rssFinder

This script retrieves all the RSS feeds of a website from its url.
I wrote this script to test the coroutines with a Promises generator.

## Table of Contents

- [Usage](#usage)
- [Input](#input)
- [Output](#output)
- [Evolution](#evolution)

## Usage

The script is designed to be called from command line

To launch it :
```
node -e 'require("./index").handler("<your.website.url>")'
```

To launch it with npm :
```
npm run find 
```

## Input

The script needs a valid url to work.

## Output

The script returns an object composed as follow :
```
{
  rss: [] // array composed with all deduped rss feeds found
  errors: [] // array composed with all urls not processed
}
```

## Evolution

...