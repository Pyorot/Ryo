const fetch = require('./fetch.js')
require('./date.js')
const error = require('./error.js')
const dex = require('./data/pokemon/pokedex.json')
const moves = require('./data/pokemon/moves.json')
var gyms = require('./data/gyms.json')
for (loc in gyms) {
    gyms[loc].raid = null
    gyms[loc].obsolete = 0
    gyms[loc].alerts = {}
}
const raidLog = require('fs').createWriteStream('./raidLog.txt')
const EOL = require('os').EOL

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

function shouldUpdate(gym, rawRaid) {
    return new Date().number() >= gym.obsolete &&
        (!gym.raid 
      || gym.raid.end < rawRaid.raid_end
      || (gym.raid.end == rawRaid.raid_end && gym.raid.id < rawRaid.pokemon_id)
        )
}

async function run() {
    let start = new Date()
    console.log('\n# Start |', start.hhmmss())
    
    let data; let raids; let length
    try {
        data = await fetch()
        raids = data.raids
        length = raids.length
    } catch (err) {
        error('x ERROR index: failed to fetch; retrying in 10s.')
        return 10
    }
    let fetchEnd = new Date()
    console.log('- Fetched | length', length, '| took', (fetchEnd.number() - start.number()).toFixed(3))
    
    let newCounter = 0
    raids.forEach(rawRaid => {
        rawRaid.loc = parseFloat(rawRaid.lat).toFixed(6) + ',' + parseFloat(rawRaid.lng).toFixed(6)
        let gym = gyms[rawRaid.loc]
        if (!gym) {error('x ERROR index: gym not found', rawRaid.loc); return}
        if (shouldUpdate(gym, rawRaid)) {
            let raid = new Raid(rawRaid)
            gym.raid = raid
            gym.obsolete = raid.active ? raid.end : raid.start - 2*60
            for (alert in gym.alerts) {/* send alert */}
            raidLog.write(rawRaid.loc+' | '+JSON.stringify(raid)+EOL)
            newCounter++
        } else {return}
    })
    let processEnd = new Date()
    console.log('- Resolved',
                '| new', newCounter,
                '| took', (processEnd.number() - fetchEnd.number()).toFixed(3))
    
    return 2*60
}

async function go() {setTimeout(go, await run()*1000)}




// Test
_rawRaid = {
    "lat": "51.510104",
    "lng": "-0.085876",
    "raid_start": "1500000000",
    "raid_end": "1500002700",
    "level": "3",
    "pokemon_id": "0",
    "team": "0",
    "move1": "0",
    "move2": "0"
}
_raid = new Raid(_rawRaid)