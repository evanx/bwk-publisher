
# bwk-publisher

NodeJS HTTP server to publish JSON content in Redis.

Named in honour of https://en.wikipedia.org/wiki/Brian_Kernighan

## Use case

We publish adhoc JSON content to the webserver via Redis:
```
echo '{
  "name": "Brian Kernighan",
  "about": "https://en.wikipedia.org/wiki/Brian_Kernighan",
  "website": "http://www.cs.princeton.edu/~bwk/",
  "quotes": [
     "Don’t comment bad code — rewrite it.",
     "The only way to learn a new programming language is by writing programs in it.",
     "If you have done something twice, you are likely to do it again."
  ]
}' | redis-cli -p 6333 -x set bwkp:people:Brian_Kernighan:json
```
where we have an `spiped` tunnel from `localhost:6333` to a cloud-based Redis instance.

Try: https://evanx.webserva.com/bwk/json/get/people/Brian_Kernighan

```
$ curl localhost:8080/bwk/json/get/people/Brian_Kernighan
{
  "name": "Brian Kernighan",
  "about": "https://en.wikipedia.org/wiki/Brian_Kernighan",
  "website": "http://www.cs.princeton.edu/~bwk/",
  "quotes": [
    "Don’t comment bad code — rewrite it.",
    "The only way to learn a new programming language is by writing programs in it.",
    "If you have done something twice, you are likely to do it again."
  ]
}
```

## Config

See `lib/config.js`
```javascript
module.exports = {
    description: 'Server to publish Redis JSON keys via HTTP.',
    required: {
        httpRoute: {
            description: 'the HTTP route',
            default: 'bwk'
        },
        httpPort: {
            description: 'the HTTP port',
            default: 8080
        },
        redisHost: {
            description: 'the Redis host',
            default: 'localhost'
        },
        redisPort: {
            description: 'the Redis port',
            default: 6379
        },
        redisPassword: {
            description: 'the Redis password',
            required: false
        },
        redisNamespace: {
            description: 'the Redis namespace for this service',
            default: 'bwkp'
        }
    }
}
```

## Implementation

See `lib/index.js`

```javascript
api.get(`/${config.httpRoute}/json/get/*`, async ctx => {
    const key = ctx.params[0].replace(/\//g, ':');
    const jsonKey = [config.redisNamespace, key, 'json'].join(':');
    logger.debug({jsonKey});
    const jsonContent = await client.getAsync(jsonKey);
    if (!jsonContent) {
        ctx.statusCode = 404;
        return;
    }
    ctx.set('Content-Type', 'application/json');
    ctx.body = JSON.stringify(JSON.parse(jsonContent), null, 2) + '\n';
});
```

https://twitter.com/@evanxsummers
