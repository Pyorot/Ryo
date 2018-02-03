fs = require('fs')
output = []

input = JSON.parse(fs.readFileSync('gymsMori.geojson'))
for (feature of input.features) {
    output.push([
        feature.geometry.coordinates[1].toFixed(6),
        feature.geometry.coordinates[0].toFixed(6),
        feature.properties.name.trim().replace(/&#039;/g,"'")
    ])
}
console.log(input.features.length, 'gyms in gymsMori')

input2 = JSON.parse(fs.readFileSync('gymsNew.json'))
output.push(...input2)
console.log(input2.length, 'gyms in gymsNew')

fs.writeFileSync('rawGyms.json',JSON.stringify(output, null, 4))
console.log('Done, total gyms', output.length)