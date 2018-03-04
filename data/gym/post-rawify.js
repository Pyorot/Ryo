fs = require('fs')
input = JSON.parse(fs.readFileSync('rawGyms.json'))
EOL = require('os').EOL

// rawGyms.csv
outputCsv = ''
for (rawGym of input) {
    outputCsv += rawGym[0]+'/'+rawGym[1]+','+rawGym[0]+','+rawGym[1]+EOL
}
fs.writeFileSync('rawGyms.csv', outputCsv)
console.log("Converted to (cv) csv.")

// rawGyms.txt
outputTxt = ''
for (rawGym of input) {
    outputTxt += rawGym[0]+','+rawGym[1]+' '+rawGym[2]+EOL
}
fs.writeFileSync('rawGyms.txt', outputTxt)
console.log("Converted to txt.")

// rawGyms.geojson
outputGeo = {
    "type": "FeatureCollection",
    "features": []
}
for (rawGym of input) {
    let point = {
        "type": "Feature",
        "properties": {},
        "geometry": {"type": "Point"}
    }
    point.geometry.coordinates = [parseFloat(rawGym[1]), parseFloat(rawGym[0])]
    point.properties.name = rawGym[2]
    outputGeo.features.push(point)
}
fs.writeFileSync('rawGyms.geojson', JSON.stringify(outputGeo, null, 4))
console.log("Converted to geojson.")