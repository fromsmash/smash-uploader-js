const assert = require('assert');
const { SmashUploader } = require('./dist/SmashUploader');

const uploader = new SmashUploader({});

assert.doesNotThrow(() => new SmashUploader({}));
