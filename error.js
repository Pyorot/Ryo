// Writes errors to stderr and to ./error.txt
require('./date.js')
const errorStream = require('fs').createWriteStream('./error.txt', {flags: 'a'})
const EOL = require('os').EOL
module.exports = function(...texts) {
    let now = new Date()
    console.error(...texts)
    errorStream.write(now.mmdd() + ' ' + now.hhmmss() + ' | ' + Array.prototype.join.call(arguments, ' ') + EOL)
}