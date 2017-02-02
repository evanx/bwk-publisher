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
        },
        blobStore: {
            description: 'the BLOB store options e.g. directory for file storage',
            default: 'tmp/data/'
        },
        blobStoreType: {
            description: 'the BLOB store type',
            default: 'fs-blob-store'
        },
        loggerLevel: {
            description: 'the logging level',
            default: 'info',
            example: 'debug'
        }
    },
    development: {
        level: 'debug'
    }
}
