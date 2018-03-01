import test from 'ava'
import 'assert'
require('../date.js')

console.log('Test start.')

test('short date', t => {
    t.is(new Date(1500000012345).hhmmss(), '03:40:12')
})
test('long date', t => {
    t.is(new Date(1500000012345).hhmmssmmm(), '03:40:12.345')
})
test('date number', t => {
    t.is(new Date(1500000012345).number(), 1500000012.345)
})