fs = require('fs')
error = require('./error.js')
module.exports = {loadAlerts: loadAlerts}

const lambdas = {
        all: raid => true,
        leg: raid => raid.tier == 5 && raid.active == false,
       ttar: raid => raid.name == 'Tyranitar',
    legttar: raid => (raid.tier == 5 && raid.active == false) || raid.name == 'Tyranitar'
}

gyms = require('./data/gyms.json')
for (let loc in gyms) {
    gyms[loc].loc = loc
    gyms[loc].raid = null
    gyms[loc].obsolete = 0
    gyms[loc].alerts = []
}

function loadAlerts() {
    // clear alerts
    for (let loc in gyms) {gyms[loc].alerts = []}
    // add alerts
    for (let folder of fs.readdirSync('channels')) {
        console.log(`\n${folder}:`)
        for (let file of fs.readdirSync('channels/'+folder)) {
            let [channelID, channelName, fileExt] = file.split('.'); channelName = folder+'/'+channelName
            if (! (/\d{18}/.test(channelID) && fileExt == 'txt')) {console.log(`. GYM: ignored ${file}.`); continue}
            let lines = fs.readFileSync('channels/'+folder+'/'+file, "utf8").split('\n').map(line => line.trim()).filter(line => line)
            for (let line of lines) {
                let [loc, filter] = line.split('#').map(line => line.trim())
                let gym = gyms[loc]
                if (!gym) {error(`x GYM: could not find gym ${loc} specified in ${channelName}.`); continue}
                let lambda = filter[0] != '~' ? lambdas[filter] : eval(`raid => ${filter.slice(1).trim()}`)
                if (!lambda) {error(`x GYM: could not find lambda ${filter} specified in ${channelName}.`); continue}
                gym.alerts.push({name: channelName, id: channelID, filter: lambda})
                console.log('. GYM: loaded', channelID, channelName, loc, gym.name, filter)
            }
        }
    }
}

if (process.env.ALERT == 'true') {
    loadAlerts()
    setInterval(loadAlerts, 24*60*60*1000)
}