const assert = require('assert');
const { SmashUploader } = require('../dist/SmashUploader');

assert.doesNotThrow(() => new SmashUploader({ region: "eu-west-3" }));
