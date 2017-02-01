
const lodash = require('lodash');

const sha = sha => sha.replace(/=+$/, '')

const key = key => key.replace(/\W/g, '-')

const keyPath = key => [
    'key',
    ...lodash.flatten(key.split(/\W/).map(part => part.match(/.{4}/g))),
    [
        key.replace(/\W/, '-'),
        'json'
    ].join('.')
].join('/')

const timestampPath = (key, date) => [
    'time',
    date.toISOString().substring(0, 10),
    date.toISOString().substring(11, 19).replace(/:/, 'h').replace(/:/, 'm'),
    [
        key.replace(/\W/, '-'),
        'json',
        'gz'
    ].join('.')
].join('/')

const shaPath = (key, sha) => [
    'sha',
    ...sha.replace(/=+$/, '').match(/.{6}/g),
    [
        sha.replace(/=+$/, ''),
        key.replace(/\W/, '-'),
        'json',
        'gz'
    ].join('.')
].join('/')

module.exports = {sha, key, keyPath, timestampPath, shaPath}
