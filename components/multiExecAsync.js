
module.exports = (client, closure) => {
    const multi = client.multi();
    closure(multi);
    return multi.execAsync();
}
