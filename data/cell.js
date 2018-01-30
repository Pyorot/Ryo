fs = require('fs')
s2 = require('s2-geometry').S2
gyms = require('./gyms.json') // indexed by point

// Gyms indexed by cell
gymCell = {}
for (let x = -18; x <= 18; x++) {
    for (let y = -12; y <= 10; y++) {
        gymCell[[x,y]] = []
    }
}
for (point in gyms) {
    gymCell[gyms[point].s2c12i].push(gyms[point])
}

// List gyms in cells (with ExE filter?)
function cell(x,y) {for (gym of gymCell[[x,y]]) {console.log(gym.name)}}
function cellEx(x,y) {for (gym of gymCell[[x,y]].filter(gym=>gym.exe)) {console.log(gym.name)}}

// Prepares ExList releases
function exlist(minX=-18, minY=-12, maxX=18, maxY=10) {
    let output = ''
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            output += 'CELL ' + x + ',' + y + '\n'
            for (gym of gymCell[[x,y]].filter(gym=>gym.exe)) {output += gym.name + '\n'}
            output += '\n'
        }
    }
    fs.writeFileSync('exlist.txt',output)
    console.log("Saved list of exe gyms to exlist.txt")
}