import { CustomEvent } from '../core/CustomEventEmitter';
import { UploaderEvent } from '../interface/Event';

export interface ChangesInput {
    event: UploaderEvent;
}

export class ChangesEvent implements CustomEvent {
    public name = 'changes';
    public event: UploaderEvent;

    constructor({ event }: ChangesInput) {
        this.event = event;
    }

    get data() {
        return {
            event: this.event,
        }
    }
}
