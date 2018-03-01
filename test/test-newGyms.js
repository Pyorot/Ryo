import test from 'ava'; import 'assert'
import {Raid, processRaid} from '../index.js'; import {reloadGym} from '../gym.js'
var fs = require('fs')

var rawRaids = fs.readFileSync('test/rawRaids.txt', 'utf8').split('\n').filter(line => line[0]=="{").map(JSON.parse)
var gymsNew = JSON.parse(fs.readFileSync('test/newGyms.txt', 'utf8'))

console.log('Test start.')

test('process unregistered gym, then load info', t => {
    let loc = "51.000000,0.000000"
    t.falsy(gyms[loc])
    
    // first scan – new gym should be initialised with raid values, but without info
    let gym = processRaid(rawRaids[1])
        t.not(gym, null)
        t.is(gyms[loc].loc, loc); t.deepEqual(gyms[loc].alerts, []); t.truthy(gyms[loc].obsolete); t.truthy(gyms[loc].raid)
        t.falsy(gyms[loc].name)
   
    // second scan – new gym should be unchanged; processRaid should return null
    let {alerts, obsolete, raid} = gyms[loc]
    gym = processRaid(rawRaids[1])
        t.is(gym, null)
        t.deepEqual(gyms[loc].alerts, alerts); t.is(gyms[loc].obsolete, obsolete); t.deepEqual(gyms[loc].raid, raid)
        t.falsy(gyms[loc].name)

    // load info – new gym should be with info; the rest should be unchanged
    reloadGym(loc, gymsNew)
        t.deepEqual(gyms[loc].alerts, alerts); t.is(gyms[loc].obsolete, obsolete); t.deepEqual(gyms[loc].raid, raid)
        t.is(gyms[loc].name, '[new]')
})

test('load info, then process new gym', t => {
    let loc = "51.000001,0.000001"
        t.falsy(gyms[loc])

    // load info – new gym should be with info and initialised to defaults
    reloadGym(loc, gymsNew)
        t.is(gyms[loc].name, '[new]')
        t.is(gyms[loc].loc, loc); t.deepEqual(gyms[loc].alerts, []); t.is(gyms[loc].obsolete, 0); t.is(gyms[loc].raid, null)
    
    // first scan – new gym should be with info and with values set to loc, obsolete, raid, but not alert
    let gym = processRaid(rawRaids[2])
        t.not(gym, null)
        t.is(gyms[loc].name, '[new]')
        t.is(gyms[loc].loc, loc); t.deepEqual(gyms[loc].alerts, []); t.truthy(gyms[loc].obsolete); t.truthy(gyms[loc].raid)
    
    // second scan – new gym should be unchanged; processRaid should return null
    let {alerts, obsolete, raid, name} = gyms[loc]
    gym = processRaid(rawRaids[2])
        t.is(gym, null)
        t.deepEqual(gyms[loc].alerts, alerts); t.is(gyms[loc].obsolete, obsolete); t.deepEqual(gyms[loc].raid, raid); t.is(gyms[loc].name, name)
})