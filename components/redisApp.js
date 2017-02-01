const assert = require('assert');
const lodash = require('lodash');
const redis = require('redis');
const bluebird = require('bluebird');
const clc = require('cli-color');
const multiExecAsync = require('./multiExecAsync');
const reduceSpec = require('./reduceSpec');
const Promise = bluebird;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const debug = () => undefined;

module.exports = async spec => {
    debug(`redisApp '${spec.description}' {${Object.keys(spec.required).join(', ')}}`);
    try {
        const defaults = spec[process.env.NODE_ENV || 'production'];
        const config = reduceSpec(spec, process.env, {defaults});
        const options = lodash.pick(config, 'host', 'port', 'password');
        const client = redis.createClient(options);
        process.on('unhandledRejection', err => {
            console.error(err.message);
            client.quit();
            client.quit();
            process.exit(1);
        });
        const logger = require('./redisLogger')(config, redis);
        return {
            assert, lodash, Promise,
            redis, client, logger, config,
            multiExecAsync
        };
    } catch (err) {
        console.error(err, ['', clc.red.bold(err.message), ''].join('\n'));
        process.exit(1);
    }
};
