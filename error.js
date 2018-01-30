// Writes errors to stderr and to ./error.txt
Date.prototype.full = function() {return this.toDateString() + ' ' + this.toTimeString().slice(0,8) + ' | '}
const errorStream = require('fs').createWriteStream('./error.txt', {flags: 'a'})
const EOL = require('os').EOL
module.exports = function(...texts) {
    console.error(...texts)
    errorStream.write(new Date().full() + Array.prototype.join.call(arguments, ' ') + EOL)
}