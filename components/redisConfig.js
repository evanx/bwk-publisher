
const reduceSpec = require('./reduceSpec')
const multiExecAsync = require('./multiExecAsync');

module.exports = async (configKey, metas, client) => {
    const [hashes] = await multiExecAsync(client, multi => {
        multi.hgetall(configKey);
    });
    return Object.assign(reduceSpec(metas, hashes);
};
