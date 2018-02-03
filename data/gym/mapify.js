fs = require('fs')
input = JSON.parse(fs.readFileSync('rawGyms.json'))

output = {
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
    output.features.push(point)
}

fs.writeFileSync('./rawGymsGeo.geojson',JSON.stringify(output, null, 4))