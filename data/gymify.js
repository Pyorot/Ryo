fs = require('fs')
s2 = require('s2-geometry').S2
csvParse = require('csv-parse/lib/sync')
cellDict = require('./cellDict.json')
gyms = {}
s2c12 = {}
gymosmcsv = ''
console.log("Loaded")

input = JSON.parse(fs.readFileSync('pgmGyms.json'))
console.log("Read pgmGyms")

for (gymRaw of input.features) {
    let gym = {}
    gym.point = [gymRaw.geometry.coordinates[1].toFixed(6), gymRaw.geometry.coordinates[0].toFixed(6)]
    gym.name = gymRaw.properties.name.trim().replace(/&#039;/g,"'")
    let s2c20px = s2.keyToLatLng(s2.latLngToKey(...gym.point, 20))
    gym.s2c20p = [s2c20px.lat, s2c20px.lng]
    gym.s2c12 = s2.latLngToKey(...gym.point, 12)
    gym.s2c12i = cellDict[gym.s2c12]; if (!gym.s2c12i) {console.error('s2-12 cell location failed:', JSON.stringify(gym.point)); return}
    gyms[gym.point] = gym
    gymosmcsv += gym.point[0] + '/' + gym.point[1] + ',' + gym.point[0] + ',' + gym.point[1] + '\n'
    gym.exe = false
}

console.log("Processed", input.features.length, "gyms;", Object.keys(gyms).length, "unique")

exgymscsv = fs.readFileSync('./exGyms.csv')
console.log("Read exGyms")
exgyms = csvParse(exgymscsv)
for (row of exgyms) {gyms[row[0].replace('/',',')].exe = true}
console.log("Ex-labelled gyms")

fs.writeFileSync('gyms.json', JSON.stringify(gyms))
fs.writeFileSync('gyms.csv', gymosmcsv)
console.log("Wrote JSON and CSV")

// s2.keyToLatLng(key) = {lat, lng}
// s2.latLngToKey(lat, lng, level)
// s2.latLngToNeighborKeys(lat, lng, level)
// [ keyLeft, keyDown, keyRight, keyUp ] 