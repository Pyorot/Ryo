// globals
dotenv = require('dotenv'); dotenv.load()   // loads env variables from .env into process.env
require('./date.js')                        // adds methods to Date prototype
error = require('./error.js')               // error logger
EOL = require('os').EOL                     // end of line
gyms = {}                                   // the gyms data model, modified by the rest of the app

// process.stdout.write(String.fromCharCode(27) + "]0;" + 'Ryo' + String.fromCharCode(7)) // sets console title
console.log('# Ryo')
const fetch = require('./fetch.js')         // data getter
const gymer = require('./gym.js')           // manages gym data and loads alert settings (loads gyms on first run)
const log = require('./log.js')             // logs raid data
const alert = require('./alert.js')         // prepares and sends alerts

// creates raids from rawRaids (raw data format) using data from /data/pokemon/
var dex = require('./data/pokemon/pokedex.json')
var moves = require('./data/pokemon/moves.json')
function Raid(rawRaid) {
    this.start = parseInt(rawRaid.raid_start)
    this.end = parseInt(rawRaid.raid_end)
    this.id = parseInt(rawRaid.pokemon_id)
    this.name = dex[rawRaid.pokemon_id]
    this.tier = parseInt(rawRaid.level)
    this.active = this.id != 0              // active = boss, inactive = egg
    if (this.active) {
        this.team = {0:'None',1:'Mystic',2:'Valor',3:'Instinct'}[rawRaid.team]
        this.move1 = moves[rawRaid.move1]
        this.move2 = moves[rawRaid.move2]
    }
}

// determines if a raid is new to a gym
function shouldUpdate(gym, rawRaid) {
    return new Date().number() >= gym.obsolete &&                               // skip if previous raid not obsolete
        (!gym.raid                                                              // if there hasn't been a raid yet
      || gym.raid.end < rawRaid.raid_end                                        // if the previous raid ends earlier
      || (gym.raid.end == rawRaid.raid_end && gym.raid.id < rawRaid.pokemon_id) // if it's the same raid but boss rather than egg
        )
}

// updates gyms with new raids, returning the raid gym if updated, and null if no update
function processRaid(rawRaid) {
    let loc = parseFloat(rawRaid.lat).toFixed(6) + ',' + parseFloat(rawRaid.lng).toFixed(6)
    rawRaid.loc = loc                                       // the key format under which gyms are stored in gyms
    // does gym at loc exist?
    if (!gyms[rawRaid.loc]) {
        error(`x INDEX: gym not found: ${rawRaid.loc}.`)
        gymer.initGym(rawRaid.loc)                          // adds a new info-less gym to gyms at loc
    }
    let gym = gyms[rawRaid.loc]                             // assert not undefined!
    // is the raid new?
    if (shouldUpdate(gym, rawRaid)) {
        let raid = new Raid(rawRaid)
        gym.raid = raid
        gym.obsolete = raid.active ? raid.end : raid.start - 2*60   // bosses obsolete when expired, eggs 2 mins before hatch
        return gym
    } else {
        return null
    }
}

// runs an instance of fetch + process, and returns the intended timeout to the next run
async function run() {
    let start = new Date()
    console.log('\n# Start |', start.hhmmss())
    
    // fetch
    let data; let raids; let length
    try {                                                   // resolve new data and check format compliance
        data = await fetch()
        raids = data.raids
        length = raids.length
    } catch (err) {
        error(`x LPM: failed to fetch (${err}); retrying in 10s.`)
        return 10
    }
    let fetchEnd = new Date()
    console.log('- Fetched | length', length, '| took', (fetchEnd.number() - start.number()).toFixed(3))
    
    // resolve
    let newCounter = 0                                      // counts the raids not found in previous cycles ("new")
    for (rawRaid of raids) {
        let gym = processRaid(rawRaid)                      // see processRaid
        if (gym !== null) {                                 // if raid is new
            if (process.env.ALERT == 'true') {alert(gym)}
            if (process.env.LOG == 'true') {log.write(gym)}
            newCounter++
        }
    }
    let processEnd = new Date()

    // cicadian
    let timeout = 60                                        // default period is 1 min
    if (start.getHours() == 21) {                           // when it first hits 9pm–10pm,
        timeout = (7*60+30)*60                              // the cycle times out to 4:30am
        if (process.env.LOG == 'true') {setTimeout(log.restart, 4*60*60*1000)}                  // with a log restart set for 1am
        if (process.env.ALERT == 'true') {setTimeout(gymer.loadAlerts, (4*60*60 + 15)*1000)}    // and an alert reload set for 15s later
    }
    
    console.log('- Resolved',
                '| new', newCounter,
                '| took', (processEnd.number() - fetchEnd.number()).toFixed(3),
                '| timeout', timeout+'s')
    return timeout
}

// runs fetch + process loop
async function go() {setTimeout(go, await run()*1000)}
if (process.env.AUTORUN == 'true') {go()}

// To allow control from the console via keypresses
const readline = require('readline')
if (process.env.CONTROL == 'true') {
    readline.emitKeypressEvents(process.stdin); process.stdin.setRawMode(true)    // set-up
    process.stdin.on('keypress', (str, key) => {
        switch (key.name) {
            case 'h': console.log(`\n# Ryo | Commands: h - help; a - reload alerts; g - reload gym data; l - restart log; x = exit.`); break
            case 'a': gymer.loadAlerts(); break
            case 'g': gymer.reloadGyms(); break
            case 'l': if (process.env.LOG == 'true') {log.restart()} else {console.log(`\n# INDEX: log is disabled.`)}; break
            case 'x': process.exit()
        }
    })
}

// To make the auto testing work
module.exports = {Raid: Raid, processRaid: processRaid}