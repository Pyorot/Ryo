fs = require('fs')
s2 = require('s2-geometry').S2
cellDict = {"2/100323000212": [0,0]}

function search(key) {
    console.log(key, JSON.stringify(cellDict[key]))
    let latlng = s2.keyToLatLng(key)
    let neighbors = s2.latLngToNeighborKeys(latlng.lat, latlng.lng, 12)
    let point = cellDict[key]
    for (let nkey of neighbors) {
        if (nkey in cellDict) {continue}
        let neighlatlng = s2.keyToLatLng(nkey)
        let delta = {x: neighlatlng.lng - latlng.lng, y: neighlatlng.lat - latlng.lat}
        for (dir in delta) {delta[dir] = Math.abs(delta[dir]) >= 0.01 ? Math.sign(delta[dir]) : 0}
        if (Math.abs(delta.y) + Math.abs(delta.x) != 1) {console.log("Sensitivity error."); process.exit()}
        let nx = point[0] + delta.x; let ny = point[1] + delta.y
        if (!(-18 <= nx && nx <= 18 && -12 <= ny && ny <= 10)) {continue}
        cellDict[nkey] = [nx, ny]
        search(nkey)
    }
}
search("2/100323000212")

fs.writeFileSync('cellDict.json', JSON.stringify(cellDict))
console.log('Written')
/*

function NW(x,y) {
    for (x=0; x>-17; x--) {
        for (y=0; y>-10; y--) {
            console.log(x,y)
            let key = cellDict[[x,y]]; if (!key) {throw "no key"+x+","+y}
            let latlng = s2.keyToLatLng(key)
            let neighbors = s2.latLngToNeighborKeys(latlng.lat, latlng.lng, 12)
            if (!([x-1,y] in cellDict)) {cellDict[[x-1,y]] = neighbors[0]}
            if (!([x,y-1] in cellDict)) {cellDict[[x,y-1]] = neighbors[3]}
        }
    }
}
function SW(x,y) {
    for (x=0; x>-17; x--) {
        for (y=0; y<12; y++) {
            console.log(x,y)
            let key = cellDict[[x,y]]; if (!key) {throw "no key"+x+","+y}
            let latlng = s2.keyToLatLng(key)
            let neighbors = s2.latLngToNeighborKeys(latlng.lat, latlng.lng, 12)
            if (!([x-1,y] in cellDict)) {cellDict[[x-1,y]] = neighbors[0]}
            if (!([x,y+1] in cellDict)) {cellDict[[x,y+1]] = neighbors[1]}
        }
    }
}
function NE(x,y) {
    for (x=0; x<18; x++) {
        for (y=0; y>-10; y--) {
            console.log(x,y)
            let key = cellDict[[x,y]]; if (!key) {throw "no key"+x+","+y}
            let latlng = s2.keyToLatLng(key)
            let neighbors = s2.latLngToNeighborKeys(latlng.lat, latlng.lng, 12)
            if (!([x+1,y] in cellDict)) {cellDict[[x+1,y]] = neighbors[2]}
            if (!([x,y-1] in cellDict)) {cellDict[[x,y-1]] = neighbors[3]}
        }
    }
}
function SE(x,y) {
    for (x=0; x<18; x++) {
        for (y=0; y<12; y++) {
            console.log(x,y)
            let key = cellDict[[x,y]]; if (!key) {throw "no key"+x+","+y}
            let latlng = s2.keyToLatLng(key)
            let neighbors = s2.latLngToNeighborKeys(latlng.lat, latlng.lng, 12)
            if (!([x+1,y] in cellDict)) {cellDict[[x+1,y]] = neighbors[2]}
            if (!([x,y+1] in cellDict)) {cellDict[[x,y+1]] = neighbors[1]}
        }
    }
}
NW(0,0)
NE(0,0)
SW(0,0)
SE(0,0)
console.log("Done")

for (x=-17; x<=18; x++) {
    for (y=-10; y<=12; y++) {
        let resp = cellDict[[x,y]]
        if (!resp) {console.log(x,y)}
    }
}

cellDict2 = {}
for (key in cellDict) {cellDict2[cellDict[key]] = key}

fs.writeFileSync('cellDict.json', JSON.stringify(cellDict2))
*/



/*
cellDict[s2.latLngToKey(start[0], start[1], 12)] = [-17.-10]
    let key = ''
    let lng = start[1]
    let lat
    for (x=-17; x<=18; x++) {
        lat = start[0]
        for (y=-10; y<=12; y++) {
            while (s2.latLngToKey(lng, lat, 12) == key) {lat += 0.0005}
            key = s2.latLngToKey(lng, lat, 12)
            lat = s2.keyToLatLng(key).lat
            lng = s2.keyToLatLng(key).lng
            cellDict[s2.latLngToKey(lng, lat, 12)] = [x, y]
        }
    }
*/