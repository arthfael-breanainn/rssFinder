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