# Automated test suite
Here are the beginnings of an automated test suite. It uses [AVA](https://github.com/avajs/ava).

## How to run
Note that `CONTROL` in `.env` must be set to false because reasons.
* `npm test`: runs the full suite of tests.
* `npm test-w`: runs the full suite under watch mode (autorun after saving a source file).

## Coverage
* `test-date.js` covers some basic functionality of `date.js`.
* `test-newGyms.js` covers the standard workflow of adding new gyms, whether automatically from incoming raid data or manually from updating `gyms.json`.