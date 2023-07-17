import { CustomEvent } from '../core/CustomEventEmitter';

export interface StartingEventInput {
    status: string;
    startingDate: string;
}

export class StartingEvent implements CustomEvent {
    public name = 'starting';
    public status: string;
    public startingDate: string;

    constructor({ status, startingDate }: StartingEventInput) {
        this.status = status;
        this.startingDate = startingDate;
    }

    get data() {
        return {
            startingDate: this.startingDate,
            status: this.status,
        }
    }
}
