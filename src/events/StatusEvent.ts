import { CustomEvent } from '../core/CustomEventEmitter';
import { UploaderStatus } from '../globals/constant';

export interface StatusEventInput {
    status: UploaderStatus;
}

export class StatusEvent implements CustomEvent {
    public name = 'status';
    public status: UploaderStatus;

    constructor({ status }: StatusEventInput) {
        this.status = status;
    }

    get data() {
        return {
            status: this.status,
        }
    }
}
