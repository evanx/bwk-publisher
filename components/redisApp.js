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
        const client = redis.createClient({
            host: config.redisHost,
            port: config.redisPort,
            password: config.redisPassword
        });
        const ends = [async () => client.end()];
        const logger = require('./redisLogger')(config, redis);
        const end = async code => {
            await Promise.all(ends.map(end => end()));
            process.exit(code);
        };
        process.on('unhandledRejection', err => {
            console.error(err.message);
            end(1);
        });
        return {
            ends, end,
            assert, lodash, Promise,
            redis, client, logger, config,
            multiExecAsync
        };
    } catch (err) {
        console.error(err, ['', clc.red.bold(err.message), ''].join('\n'));
        process.exit(1);
    }
};
