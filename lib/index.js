
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

async function main(state) {
    Object.assign(global, state, {state});
    logger.level = config.loggerLevel;
    logger.info({config});
    const app = new Koa();
    const api = KoaRouter();
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
    app.use(api.routes());
    app.use(async ctx => {
       ctx.statusCode = 404;
    });
    const server = app.listen(config.httpPort);
    ends.push(async () => {
        server.close();
    });
}
