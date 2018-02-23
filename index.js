// globals
dotenv = require('dotenv'); dotenv.load() // loads env variables from .env into process.env
require('./date.js')
error = require('./error.js')
EOL = require('os').EOL
gyms = {}

const fetch = require('./fetch.js')
const gymer = require('./gym.js') // loads gyms variable and alerts if .env.ALERT
const log = require('./log.js') // loads raid logger if .env.LOG
const alert = require('./alert.js')

// creates raids from rawRaids using data from /data/pokemon/
var dex = require('./data/pokemon/pokedex.json')
var moves = require('./data/pokemon/moves.json')
function Raid(rawRaid) {
    this.start = parseInt(rawRaid.raid_start)
    this.end = parseInt(rawRaid.raid_end)
    this.id = parseInt(rawRaid.pokemon_id)
    this.name = dex[rawRaid.pokemon_id]
    this.tier = parseInt(rawRaid.level)
    this.active = this.id != 0
    if (this.active) {
        this.team = {0:'None',1:'Mystic',2:'Valor',3:'Instinct'}[rawRaid.team]
        this.move1 = moves[rawRaid.move1]
        this.move2 = moves[rawRaid.move2]
    }
}

// checks if a rawRaid is new to a gym
function shouldUpdate(gym, rawRaid) {
    return new Date().number() >= gym.obsolete &&
        (!gym.raid 
      || gym.raid.end < rawRaid.raid_end
      || (gym.raid.end == rawRaid.raid_end && gym.raid.id < rawRaid.pokemon_id)
        )
}

// runs an instance of fetch + process, and returns timeout to next intended run
async function run() {
    let start = new Date()
    console.log('\n# Start |', start.hhmmss())
    
    let data; let raids; let length
    try {
        data = await fetch()
        raids = data.raids
        length = raids.length
    } catch (err) {
        error(`x LPM: failed to fetch (${err}); retrying in 10s.`)
        return 10
    }
    let fetchEnd = new Date()
    console.log('- Fetched | length', length, '| took', (fetchEnd.number() - start.number()).toFixed(3))
    
    let newCounter = 0
    raids.forEach(rawRaid => {
        let lat = parseFloat(rawRaid.lat).toFixed(6); let lng = parseFloat(rawRaid.lng).toFixed(6)
        rawRaid.loc = lat + ',' + lng
        let gym = gyms[rawRaid.loc]
        if (!gym) {                                // should make a note and add gym temporarily
            error(`x INDEX: gym not found: ${rawRaid.loc}.`)
            gym = {loc: rawRaid.loc, raid: null, obsolete: 0, alerts: []}
            gyms[rawRaid.loc] = gym
        }
        if (shouldUpdate(gym, rawRaid)) {          // should update gym in gyms model, and log + alert it
            let raid = new Raid(rawRaid)
            gym.raid = raid
            gym.obsolete = raid.active ? raid.end : raid.start - 2*60
            if (process.env.ALERT == 'true') {alert(gym)}
            if (process.env.LOG == 'true') {log(gym)}
            newCounter++
        }
    })

    let processEnd = new Date()
    let timeout = start.getHours() <= 20 ? 2*60 : (7*60+45)*60
    console.log('- Resolved',
                '| new', newCounter,
                '| took', (processEnd.number() - fetchEnd.number()).toFixed(3),
                '| timeout', timeout+'s')
    return timeout
}

// runs fetch + process loop
async function go() {setTimeout(go, await run()*1000)}
if (process.env.AUTORUN == 'true') {go()}

// Test
_rawRaid = {
    "lat": "51.505868",
    "lng": "-0.203477",
    "raid_start": "1500000000",
    "raid_end": "1500002700",
    "level": "3",
    "pokemon_id": "65",
    "team": "3",
    "move1": "235",
    "move2": "247"
}
_raid = new Raid(_rawRaid)
_loc = "51.505868,-0.203477"
_gym = gyms[_loc]
_gym.raid = _raid
_hpChannel = {
    name: 'hpex',
    id: "410243553386692609",
    filter: raid => true
}
_pys1 = {
    name: 'PyS1',
    id: "293838131407486980",
    filter: raid => true
}