import { CustomEvent } from '../core/CustomEventEmitter';

export interface QueuedEventInput {
    transfer: {
        id: string;
        status: string;
        region: string;
        transferUrl: string;
        uploadState: string;
        availabilityEndDate: string;
        availabilityDuration: number;
        availabilityStartDate: string;
        queuedUntil: string;
        preview: string;
        created: string;
        modified: string;
        size: number;
        filesNumber: number;
    };
}

export class QueuedEvent implements CustomEvent {
    public name = 'queued';
    public transfer: {
        id: string;
        status: string;
        region: string;
        transferUrl: string;
        uploadState: string;
        availabilityEndDate: string;
        availabilityDuration: number;
        availabilityStartDate: string;
        queuedUntil: string;
        preview: string;
        created: string;
        modified: string;
        size: number;
        filesNumber: number;
    };

    constructor({
        transfer,
    }: QueuedEventInput) {
        this.transfer = transfer;
    }

    get data() {
        return {
            transfer: this.transfer,
        }
    }
}
