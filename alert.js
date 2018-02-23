error = require('./error.js')
require('./date.js')
const post = require('./post.js')
module.exports = alert

// filters and sends gym
function alert(gym) {
    let raid = gym.raid
        if (!raid) {error(`x ALERT: no raid at gym ${gym.name}.`); return}
    for (let channel of gym.alerts) {
        try {
            var pass = channel.filter(raid)
        } catch (err) {
            error(`x ALERT: ${channel.name} failed to filter a raid.`)
            error(`x ALERT [unknown dump]: ${err}`)
        }
        if (pass) {
            if (!raid.text) {raid.text = tell(gym)}
            send(channel, gym)
        }
    }
}

// converts gym to notification text
function tell(gym) {
    let raid = gym.raid
    return raid.tier + '* ' + (raid.active? "🐣 " + raid.name : "🥚")
         + '\n| ' + (gym.exe? '⭐ ' : '') + gym.name
         + '\n| ' + raid.start.date().hhmmss() + ' – ' + raid.end.date().hhmmss()
         + (raid.active? '\n| ' + raid.move1 + '/' + raid.move2 + ' | ' + raid.team : '')
}

// converts gym to Discord message and attempts to send to channel
async function send(channel, gym) {
    let postInfo = channel.name + ' > ' + gym.raid.name + ' ' + gym.raid.start.date().hhmmss()
    let message = {
        content: gym.raid.text ? gym.raid.text : '#TEXT',
        embed: {
            title: "Map link",
            url: 'http://maps.google.com/maps?q='+gym.loc,
            footer: {text: 'Sent at: ' + new Date().hhmmss()}
        }
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            if (process.env.POST == 'true') {
                await post.discord(channel.id, message)
            }
            console.log(`> Sent ${process.env.POST == 'true' ? '' : '[test]'} > ${postInfo}`)
            break
        } catch (err) {
            error(`x ALERT: failed to post (${err}) | attempt ${attempt} | ${postInfo}`)
            await new Promise(resolve => setTimeout(resolve, 5*1000))   // = sleep(5)
        }
    }
}