error = require('./error.js')
const request = require('superagent')
module.exports = fetch

function fetch() {
    let url = 'https://londonpogomap.com/raids.php'
    return new Promise((resolve,reject) => {
        request
            .get(url)
            .timeout({
                response: 5*1000,  // to start receiving
                deadline: 10*1000, // to finish receiving
            })
            .set('user-agent', "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
            .set('authority', 'londonpogomap.com')
            .set('referer', 'https://londonpogomap.com/')
            .set('x-requested-with', 'XMLHttpRequest')
            .then(data => {
                data = data.body
                if (data.raids && data.meta) {
                    resolve(data)
                } else {
                    reject('garbage')
                }
            })
            .catch(err => {
                if (err.response) {
                    reject('http-' + err.response.status)
                } else if (err.errno == 'ETIMEDOUT') {
                    reject('timeout-auto')
                } else {
                    error('x LPM [unknown dump]:', JSON.stringify(err))
                    reject('unknown')
                }
            })
        setTimeout(() => reject('timeout-manual'), 10*1000)    // manual rejection after 10s (to prevent hanging awaiting reply)
    })
}

// A litany of errors:
// garbage: LPM responded with no error, but sent incorrectly-formatted data.
// http-xxx: LPM (or Cloudflare) responded with an error.
// timeout-auto: LPM didn't respond, and superagent called a timeout.
// timeout-manual: LPM didn't respond, and superagent missed a timeout.