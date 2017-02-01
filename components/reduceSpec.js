
const lodash = require('lodash');
const clc = require('cli-color');

module.exports = (spec, params, options = {}) => Object.keys(spec.required).map(key => {
    const meta = spec.required[key];
    meta.key = key;
    if (meta.default !== undefined) {
        if (meta.type === undefined) {
            if (Number.isInteger(meta.default)) {
                meta.type = 'integer';
            }
            if (meta.example === undefined) {
                meta.example = meta.default;
            }
        }
    }
    return meta;
}).reduce((props, meta) => {
    const key = meta.key;
    try {
        if (options.debug) {
            console.log('meta', meta);
        }
        if (params[key]) {
            const value = params[key];
            if (!value.length) {
                throw new Error(`Property '${key}' is empty'`);
            }
            if (meta.type === 'integer') {
                props[key] = parseInt(value);
            } else {
                props[key] = value;
            }
        } else if (meta.default !== undefined) {
            props[key] = meta.default;
        } else if (options.required === false) {
        } else if (!props[key]) {
            const meta = spec.required[key];
            if (meta.required !== false) {
                throw new Error(`Missing required '${key}'`);
            }
        }
        return props;
    } catch (err) {
        console.log([
            clc.green.bold(spec.description),
            clc.white.bold('Options:'),
            ...Object.keys(spec.required).map(
                key => spec.required[key]
            ).map(
                formatMeta
            ).map(
                lines => lines.map(line => `  ${clc.cyan(line)}`).join('\n')
            )
        ].join('\n'));
        throw err;
    }
}, options.defaults || {});

const formatMeta = meta => {
    let lines = [lodash.capitalize(meta.description.slice(0, 1)) + meta.description.slice(1)];
    if (meta.hint) {
        lines.push(`Hint: ${meta.hint}`);
    }
    if (meta.note) {
        lines.push(clc.white(`Note: ${meta.note}`));
    }
    if (false && meta.type) {
        lines.push(`type: ${meta.type}`);
    }
    return [
        (meta.example === undefined)
        ? `${clc.bold(meta.key)}`
        : (meta.type === 'integer' || !/\s/.test(meta.example))
        ? `${clc.bold(meta.key)}=${meta.example}`
        : `${clc.bold(meta.key)}='${meta.example}'`
        ,
        ...lines.map(line => `  ${line}`)
    ];
};
