
# bwk-publisher

NodeJS HTTP server to publish JSON content in Redis.

Named in honour of https://en.wikipedia.org/wiki/Brian_Kernighan

<img src="https://raw.githubusercontent.com/evanx/bwk-publisher/master/docs/readme/Brian_Kernighan_json.png"/>

## Use case

We publish adhoc JSON content to the webserver via Redis:
```
cat test/Brian_Kernighan.json |
  redis-cli -p 6333 -x set bwkp:people:Brian_Kernighan:json
```
where we have an `spiped` tunnel from `localhost:6333` to a cloud-based Redis instance.

This service connects to that Redis instance, and is exposed via Nginx:
```
server {
   listen 443 ssl;
   server_name evanx.webserva.com;
   ssl_certificate /etc/letsencrypt/live/evanx.webserva.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/evanx.webserva.com/privkey.pem;
   location /bwk {
     proxy_pass http://localhost:8841;
   }
}
```

Try: https://evanx.webserva.com/bwk/json/get/people/Brian_Kernighan

This is useful for publishing adhoc JSON documents quickly e.g. a "pastebin" for JSON documents that you can pipe into locally to publish remotely, e.g. using `redis-cli` and `spiped`

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
            default: 8841
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

## Docker

You can build as follows:
```
docker build -t bwk-publisher https://github.com/evanx/bwk-publisher.git
```

### Thanks for reading

https://twitter.com/@evanxsummers
