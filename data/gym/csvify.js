fs = require('fs')
input = JSON.parse(fs.readFileSync('rawGyms.json'))
EOL = require('os').EOL

output = ''
for (rawGym of input) {
    output += rawGym[0]+'/'+rawGym[1]+','+rawGym[0]+','+rawGym[1]+EOL
}
fs.writeFileSync('rawGyms.csv', output)