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

To launch it in cmdLine :
```
node -e 'require("./src/main").handler("<your.website.url>")'
```

To launch it as an API server :
```
npm start
```

## Input

The script needs a valid url to work.

## Output

The script returns an object composed as follow :
```
{
  rss: [], // array composed with all deduped rss feeds found
  errors: [] // array composed with all urls not processed
}
```

## Evolution

...