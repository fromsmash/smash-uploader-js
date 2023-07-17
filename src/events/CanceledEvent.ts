import { CustomEvent } from '../core/CustomEventEmitter';

export interface CanceledEventInput {
    cancelDate: string;
}

export class CanceledEvent implements CustomEvent {
    public name = 'canceled';
    public cancelDate: string;

    constructor({
        cancelDate
    }: CanceledEventInput) {
        this.cancelDate = cancelDate;
    }

    get data() {
        return {
            cancelDate: this.cancelDate,
        }
    }
}
