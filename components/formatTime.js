module.exports = date => [
    date.getHours(), date.getMinutes(), date.getSeconds()
].map(
    v => ('0' + v).slice(-2)
).join(':');
