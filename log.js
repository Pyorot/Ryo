// globals
fs = require('fs')
error = require('./error.js')
require('./date.js')
EOL = require('os').EOL

if (!fs.existsSync('log')) {fs.mkdirSync('log')}
var raidLog
module.exports = write

// file management
function start() {raidLog = fs.createWriteStream(`./log/${new Date().mmdd()}.csv`, {flags:'a'})}
function restart() {raidLog.end(); start()}
if (process.env.LOG == 'true') {start(); setInterval(restart, 24*60*60*1000)}

function write(gym) {raidLog.write(record(gym) + EOL)}

// converts gym to log csv format
function record(gym) {
    let raid = gym.raid
        if (!raid) {error(`x LOG: no raid at gym ${gym.name}.`); return}
    let record = gym.loc + ','
               + raid.start.date().hhmmss() + ','
               + raid.end.date().hhmmss() + ','
               + raid.id + ','
               + raid.name + ','
               + raid.tier + ','
               + raid.active
    if (raid.active) {record += ',' + raid.team + ',' + raid.move1 + ',' + raid.move2}
    return record
}