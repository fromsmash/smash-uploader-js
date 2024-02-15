import { CustomEvent } from '../core/CustomEventEmitter';

export interface StartingEventInput {
    startingDate: string;
}

export class StartingEvent implements CustomEvent {
    public name = 'starting';
    public startingDate: string;

    constructor({ startingDate }: StartingEventInput) {
        this.startingDate = startingDate;
    }

    get data() {
        return {
            startingDate: this.startingDate,
        }
    }
}
