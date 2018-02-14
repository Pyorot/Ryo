const fs = require('fs')
const dotenv = require('dotenv'); dotenv.load() // loads env variables from .env into process.env
const fetch = require('./fetch.js')
const post = require('./post.js')
require('./date.js')
const error = require('./error.js')
const dex = require('./data/pokemon/pokedex.json')
const moves = require('./data/pokemon/moves.json')
var gyms = require('./data/gyms.json')
if (process.env.LOG == 'true') {var raidLog = fs.createWriteStream('./raidLog.txt', {flags:'a'})}
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
            if (process.env.ALERT == 'true') {try {alert(gym)} catch (err) {error('x SYNC RAID ALERT CRASH', err)}}
            if (process.env.LOG == 'true') {log(gym)}
            newCounter++
        }
    })
    let processEnd = new Date()
    console.log('- Resolved',
                '| new', newCounter,
                '| took', (processEnd.number() - fetchEnd.number()).toFixed(3))
    
    return 2*60
}

function alert(gym) {
    let raid = gym.raid; if (!raid) {error('x ALERT: NO RAID', ':', gym.name); return}
    for (channel of gym.alerts) {
        if (channel.filter(raid)) {
            if (!raid.text) {raid.text = tell(gym)}
            post.post(channel, gym)
              .catch(err => error('x ASYNC POST EXCEPTION'))
        }
    }
}

function log(gym) {
    let raid = gym.raid; if (!raid) {error('x LOG: NO RAID', ':', gym.name); return}
    let record = gym.point[0]+'/'+gym.point[1] + ','
               + raid.start.date().hhmmss() + ','
               + raid.end.date().hhmmss() + ','
               + raid.id + ','
               + raid.name + ','
               + raid.tier + ','
               + raid.active
    if (raid.active) {record += ',' + raid.team + ',' + raid.move1 + ',' + raid.move2}
    raidLog.write(record + EOL)
}

function tell(gym) {
    let raid = gym.raid
    return raid.tier + '* ' + (raid.active? "🐣 " + raid.name : "🥚")
         + '\n| ' + (gym.exe? '⭐ ' : '') + gym.name
         + '\n| ' + raid.start.date().hhmmss() + ' – ' + raid.end.date().hhmmss()
         + (raid.active? '\n| ' + raid.move1 + '/' + raid.move2 + ' | ' + raid.team : '')
}

lambdas = {
    all: raid => true
}

function load() {
    for (loc in gyms) {
        gyms[loc].raid = null
        gyms[loc].obsolete = 0
        gyms[loc].alerts = []
    }

    for (let folder of fs.readdirSync('channels')) {
        console.log(folder, ':')
        for (let file of fs.readdirSync('channels/'+folder)) {
            let fileSplit = file.split('.')
            if (fileSplit[2] == 'json') {
                let channel = JSON.parse(fs.readFileSync('channels/'+folder+'/'+file))
                for (let gymLoc in channel) {
                    let channelID = fileSplit[0]
                    let channelName = folder+'/'+fileSplit[1]
                    let filter = channel[gymLoc]
                    let lambda = filter[0] != "#" ? lambdas[filter] : eval('raid => '+filter.slice(1).trim())
                    if (!lambda) {console.error('Lambda not found:', filter); continue}
                    gyms[gymLoc].alerts.push({name: channelName, id: channelID, filter: lambda})
                    console.log(channelID, channelName, gymLoc, gyms[gymLoc].name, filter)
                }
            }
        }
        console.log()
    }
}

async function go() {setTimeout(go, await run()*1000)}
if (process.env.AUTORUN == 'true') {load(); go()}

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