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
console.log('Done')