const request = require('superagent')
const error = require('./error.js')

module.exports = fetch

function fetch() {
    url = 'https://londonpogomap.com/raids.php'
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
                    error('x ERROR LPM: returned garbage')
                    reject('garbage')
                }
            })
            .catch(err => {
                error('x ERROR LPM: failed to fetch (http)')
                if (err.response) {
                    error('       http:', err.response.status)
                } else {
                    error(JSON.stringify(err, null, 4))
                }
                reject('http')
            })
        setTimeout(() => reject('timeout'), 10*1000)    // manual rejection after 10s (to prevent hanging awaiting reply)
    })
}