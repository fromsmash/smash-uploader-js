import { SmashUploader } from '../src/SmashUploader';

describe('SmashUpload', () => {
    test('SmashUploader - should instanciate uploader', async () => {
        expect(() => new SmashUploader({ region: 'eu-west-3', token: 'test' })).not.toThrow();
    });
});
