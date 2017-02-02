
const assert = require('assert');
const crypto = require('crypto');
const zlib = require('zlib');
const lodash = require('lodash');
const Promise = require('bluebird');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const multiExecAsync = require('../components/multiExecAsync');

require('../components/redisApp')(require('./config')).then(main);

function DataError(message, data) {
    this.name = 'DataError';
    this.message = message;
    this.data = data;
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
}

function asserta(actual, expected) {
    if (actual !== expected) {
        throw new DataError('Unexpected', {actual, expected});
    }
}

function asserto(object) {
    const key = Object.keys(object).find(key => !object[key]);
    if (key) {
        throw new DataError('Missing', {key});
    }
}

function writeAsync(store, key, data) {
    return new Promise((resolve, reject) => {
        const stream = store.createWriteStream({key},
            (err, result) => err ? reject(err) : resolve(result)
        );
        stream.write(data);
        stream.end();
    });
}

async function main(state) {
    Object.assign(global, state, {state});
    logger.level = config.loggerLevel;
    logger.info({config});
    const blobStore = require(config.blobStoreType)(config.blobStore);
    const app = new Koa();
    const api = KoaRouter();
    api.get(`/${config.httpRoute}/json/get/*`, async ctx => {
        const key = ctx.params[0].replace(/\//g, ':');
        const filePath = `${ctx.params[0].replace(/\W/g, '/')}.json`;
        const jsonKey = [config.redisNamespace, key, 'json'].join(':');
        const jsonContent = await client.getAsync(jsonKey);
        if (!jsonContent) {
            ctx.statusCode = 404;
            return;
        }
        const jsonString = jsonContent.replace(/ObjectId\(("[^"]+")\)/g, '$1')
        .replace(/ISODate\(("[^"]+")\)/g, '$1');
        logger.debug({jsonKey, jsonString});
        writeAsync(blobStore, filePath, jsonString);
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify(JSON.parse(jsonString), null, 2) + '\n';
    });
    app.use(api.routes());
    app.use(async ctx => {
       ctx.statusCode = 404;
    });
    const server = app.listen(config.httpPort);
    ends.push(async () => {
        server.close();
    });
}
