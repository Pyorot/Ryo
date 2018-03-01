// globals
fs = require('fs')
require('./date.js')
error = require('./error.js')

module.exports = {initGym: initGym, reloadGym: reloadGym, reloadGyms: reloadGyms, loadAlerts: loadAlerts}

// filter lambdas for raids, assigned to gyms and channels
const lambdas = {
        all: raid => true,
        leg: raid => raid.tier == 5 && raid.active == false,
       ttar: raid => raid.name == 'Tyranitar',
    legttar: raid => (raid.tier == 5 && raid.active == false) || raid.name == 'Tyranitar'
}

// first run
gyms = require('./data/gyms.json')
for (let loc in gyms) {initGym(loc)}
console.log(`\n# GYM: loaded gyms.`)
if (process.env.ALERT == 'true') {loadAlerts()}

// Adds/replaces default loc, raid, obsolete, alerts properties to gym at loc (creates new gym if non-existent)
function initGym(loc) {
    if (!gyms[loc]) {gyms[loc] = {}}
    let gym = gyms[loc]
    gym.loc = loc; gym.raid = null; gym.obsolete = 0; gym.alerts = []
}

// Adds/replaces info for gym at loc using gymsNew (creates new gym if non-existent)
function reloadGym(loc, gymsNew) {
    if (!gymsNew[loc]) {throw 'loc not in gymsNew'}
    if (!gyms[loc]) {
        gyms[loc] = gymsNew[loc]; initGym(loc)      // creates fresh gym with new info
        console.log(`- GYM: created gym at ${loc}.`)
    } else if (!gyms[loc].name) {
        Object.assign(gyms[loc], gymsNew[loc])      // updates skeletal gym with new info
        console.log(`- GYM: loaded info at ${loc}.`)
    }  
}

// Runs reloadGym for all gyms in gyms.json
function reloadGyms() {
    let time = new Date()
    console.log()
    let gymsNew = JSON.parse(fs.readFileSync('data/gyms.json'))
    for (let loc in gymsNew) {reloadGym(loc, gymsNew)}
    console.log(`# GYM: loaded new gyms | ${time.hhmmss()}`)
}

// Clears all alerts from gyms in gyms, and adds alerts as specified in channels/ folder
function loadAlerts() {
    let time = new Date()
    // clear alerts
    for (let loc in gyms) {gyms[loc].alerts = []}

    // add alerts
    let folders = fs.readdirSync('channels').filter(file => fs.lstatSync('channels/'+file).isDirectory()); folders.push('')
    for (let folder of folders) {               // from every folder in channels/ (and from channels/ itself)
        console.log(`\n# GYM: loading alerts from ${folder}:`)
        let files = fs.readdirSync('channels/'+folder).filter(file => !fs.lstatSync('channels/'+folder+'/'+file).isDirectory())
        for (let file of files) {               // from every file (format [18-digit ID].[name].txt)
            let [channelID, channelName, fileExt] = file.split('.'); channelName = folder+'/'+channelName
                if (! (/\d{18}/.test(channelID) && fileExt == 'txt')) {console.log(`- GYM: ignored ${file}.`); continue}
            let lines = fs.readFileSync('channels/'+folder+'/'+file, 'utf8').split('\n').map(line => line.trim()).filter(line => line)
            for (let line of lines) {           // from every (non-empty) (hash-delimited) line
                let [loc, filter] = line.split('#').map(line => line.trim())
                let gym = gyms[loc]
                    if (!gym || !gym.name) {error(`x GYM: could not find named gym ${loc} specified in ${channelName}.`); continue}
                let lambda = filter[0] != '~' ? lambdas[filter] : eval(`raid => ${filter.slice(1).trim()}`)
                    if (!lambda) {error(`x GYM: could not find lambda ${filter} specified in ${channelName}.`); continue}
                gym.alerts.push({name: channelName, id: channelID, filter: lambda})
                console.log('- GYM: loaded', channelID, channelName, loc, gym.name, filter)
            }
        }
    }
    console.log(`\n# GYM: loaded alerts | ${time.hhmmss()}`)
}