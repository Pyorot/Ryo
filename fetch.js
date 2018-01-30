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
                deadline: 15*1000, // to finish receiving
            })
            .set('user-agent', "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
            .set('authority', 'londonpogomap.com')
            .set('referer', 'https://londonpogomap.com/')
            .set('x-requested-with', 'XMLHttpRequest')
            .then(data => resolve(data.body))
            .catch(err => {
                error(JSON.stringify(err.response, null, 4))
                error('x ERROR LPM:', 'failed to fetch, http status', err.response.status, ': requested', inserted, bounds)
                reject('LPM')
            })
    })
}