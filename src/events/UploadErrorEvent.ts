import { CustomEvent } from '../core/CustomEventEmitter';

export interface UploadErrorEventInput {
    error?: Error;
}
export class UploadErrorEvent implements CustomEvent {
    public name = 'error';
    public error?: Error;

    constructor({ error }: UploadErrorEventInput) {
        this.error = error;
    }

    get data() {
        return {
            error: this.error,
        }
    }
}
