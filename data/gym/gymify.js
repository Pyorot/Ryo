fs = require('fs')
s2 = require('s2-geometry').S2
csvParse = require('csv-parse/lib/sync')
cellDict = require('./cellDict.json')

input = JSON.parse(fs.readFileSync('rawGyms.json'))
gyms = {}

// constructs basic gyms from rawGyms.json and cellDict.json
for (rawGym of input) {
    let gym = {}
    let loc = rawGym[0]+','+rawGym[1]
    gyms[loc] = gym
    gym.name = rawGym[2]
    gym.point = [rawGym[0], rawGym[1]]
    gym.c12key = s2.latLngToKey(...gym.point, 12)
    gym.c12 = cellDict[gym.c12key]; if (!gym.c12) {console.error('s2l12 cell location failed:', loc); return}
    gym.exe = false
}
console.log("Processed", input.length, "gyms;", Object.keys(gyms).length, "unique")

// sets exe property using exeGyms.csv
exgyms = csvParse(fs.readFileSync('exeGyms.csv'))
for (row of exgyms) {gyms[row[0].replace('/',',')].exe = true}
console.log("Ex-labelled", exgyms.length, "gyms")

// writes gyms.csv
csvOut = ""; EOL = require('os').EOL
for (loc in gyms) {
    let gym = gyms[loc]
    csvOut += loc.replace(',','/') +','
            + gym.name.replace(/,/g,'|') +','
            + gym.c12[0]+'/'+gym.c12[1] +','
            + gym.exe +EOL
}

fs.writeFileSync('../gyms.json', JSON.stringify(gyms, null, 4))
fs.writeFileSync('gyms.csv', csvOut)
console.log("Done")