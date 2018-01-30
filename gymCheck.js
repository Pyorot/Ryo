const fetch = require('./fetch.js')
const gyms = require('./data/gyms.json')
const fs = require('fs')
// const logger = fs.createWriteStream('./unknownGyms.txt', {flags: 'a'})
const EOL = require('os').EOL

// Date methods
Date.prototype.short = function() {return this.toTimeString().slice(0,8)}
Date.prototype.long = function() {return this.toTimeString().slice(0,8) + '.' + this.getMilliseconds()}
Date.prototype.number = function() {return this.getTime()/1000}
Number.prototype.date = function() {return new Date(this*1000)}

var newGyms = {}
console.log('Until', (1517346000).date().short())

async function run() {
    let startTime = new Date()
    if (startTime.number() >= 1517346000) {
        fs.writeFileSync('./newGyms.json', JSON.stringify(newGyms, null, 4))
        console.log('The End')
        clearInterval(timer)
        process.exit()
    }
    let data
    console.log('\n# Start |', startTime.short())
    try {data = await fetch()} catch (error) {setTimeout(run, 5*1000); return}

    let fetchEnd = new Date()
    console.log('- Fetched | length', data.raids.length, '| took', (fetchEnd.number() - startTime.number()).toFixed(3))
    for (raid of data.raids) {
        raid.loc = parseFloat(raid.lat).toFixed(6) + ',' + parseFloat(raid.lng).toFixed(6)
        if (!gyms[raid.loc]) {newGyms[raid.loc] = true}
    }
    
    let processEnd = new Date()
    console.log('- Processed | accumulated', Object.keys(newGyms).length, '| took', (processEnd.number() - fetchEnd.number()).toFixed(3))
}

run(); var timer = setInterval(run, 2*60*1000)

// rawRaid spec:

// lat: string
// lng: string

// raid_spawn: string (timecode)
// raid_start: string (timecode)
// raid_end: string (timecode)
// pokemon_id: string (int, 0 = egg)
// level: string (int = tier)
// cp: string
// team: string (int)
// move1: string (int)
// move2: string (int)