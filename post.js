error = require('./error.js')
const request = require('superagent')
module.exports = discord

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
                if (err.response && err.response.text) {
                    error('x DISCORD: status:', err.response.status,
                        '\n         - discord code:', JSON.parse(err.response.text).code,
                        '\n         - discord message:', JSON.parse(err.response.text).message)
                    reject('http-' + err.response.status)
                } else if (err.errno == 'ETIMEDOUT') {
                    reject('timeout-auto')
                } else {
                    error('x DISCORD [unknown dump]:', JSON.stringify(err))
                    reject('unknown')
                }
            })
        setTimeout(() => reject('timeout-manual'), 10*1000)    // manual rejection after 10s (to prevent hanging awaiting reply)
    })
}