// globals
fs = require('fs')
error = require('./error.js')
require('./date.js')
EOL = require('os').EOL

if (!fs.existsSync('log')) {fs.mkdirSync('log')}
var raidLog
module.exports = {write: write, start: start, restart: restart}

// file management
function start() {                              // creates new file with title the current date and sets it as log destination
    let time = new Date()
    raidLog = fs.createWriteStream(`./log/${new Date().mmdd()}.csv`, {flags:'a'})
    console.log(`\n# LOG: started log | ${time.hhmmss()}`)
}
function restart() {raidLog.end(); start()}     // closes current file before starting new one
if (process.env.LOG == 'true') {start()}

function write(gym) {raidLog.write(record(gym) + EOL)}

// converts gym to log csv format
function record(gym) {
    let raid = gym.raid
        if (!raid) {error(`x LOG: no raid at gym ${gym.name}.`); return}
    let record = gym.loc.replace(',','/') + ','
               + raid.start.date().hhmmss() + ','
               + raid.end.date().hhmmss() + ','
               + raid.id + ','
               + raid.name + ','
               + raid.tier + ','
               + raid.active
    if (raid.active) {record += ',' + raid.team + ',' + raid.move1 + ',' + raid.move2}
    return record
}