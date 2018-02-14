const request = require('superagent')
const error = require('./error.js')
require('./date.js')
module.exports = {post: post, discord: discord}

async function post(channel, gym) {
    let postInfo = channel.name + ' > ' + gym.raid.name + ' ' + gym.raid.start.date().hhmmss()
    let message = {
        content: gym.raid.text ? gym.raid.text : '#TEXT',
        embed: {
            title: "Map link",
            url: 'http://maps.google.com/maps?q='+gym.point[0]+','+gym.point[1],
            footer: {text: 'Sent at: ' + new Date().hhmmss()}
        }
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await discord(channel.id, message)
            console.log('> Sent >', postInfo)
            break
        } catch (err) {
            error('x ERROR post:', err, '|', 'attempt', attempt, '|', postInfo)
            await new Promise(resolve => setTimeout(resolve, 5*1000))   // = sleep(5)
        }
    }
}

function discord(channelID, message) {    // Discord send-message wrapper
    return new Promise((resolve,reject) => {
        request
            .post('https://discordapp.com/api/channels/'+channelID+'/messages')
            .timeout({
                response: 5*1000,       // to start receiving
                deadline: 10*1000,      // to finish receiving
            })
            .set('Authorization', 'Bot ' + process.env.KEY_BOT)
            .set('User-Agent', 'Abyo')
            .type('application/json')
            .send(JSON.stringify(message))
            .then(resolve)
            .catch(err => {
                console.log(message)
                error('x ERROR Discord: (http) failed to post:', channelID, message.content.slice(0,30).replace(/\n/g," "))
                if (err.response && err.response.text) {
                    error('      - status:', err.response.status,
                        '\n      - discord code:', JSON.parse(err.response.text).code,
                        '\n      - discord message:', JSON.parse(err.response.text).message)
                    reject('http-' + err.response.status)
                } else {
                    error(JSON.stringify(err))
                    if (err.errno = 'ETIMEDOUT') {reject('timeout-auto')} else {reject('unknown')}
                }
                reject('http')
            })
        setTimeout(() => reject('timeout-manual'), 10*1000)    // manual rejection after 10s (to prevent hanging awaiting reply)
    })
}