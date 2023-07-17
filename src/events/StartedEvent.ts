import { CustomEvent } from '../core/CustomEventEmitter';

export interface StartedEventInput {
    transfer: {
        id: string;
        status: string;
        region: string;
        transferUrl: string;
        uploadState: string;
        availabilityEndDate: string;
        availabilityDuration: number;
        availabilityStartDate: string;
        preview: string;
        created: string;
        modified: string;
        size: number;
        filesNumber: number;
    };
    startedDate: string;
}

export class StartedEvent implements CustomEvent {
    public name = 'started';
    public transfer: {
        id: string;
        status: string;
        region: string;
        transferUrl: string;
        uploadState: string;
        availabilityEndDate: string;
        availabilityDuration: number;
        availabilityStartDate: string;
        preview: string;
        created: string;
        modified: string;
        size: number;
        filesNumber: number;
    };
    public startedDate: string;

    constructor({ transfer, startedDate }: StartedEventInput) {
        this.transfer = transfer;
        this.startedDate = startedDate;
    }

    get data() {
        return {
            transfer: this.transfer,
            startedDate: this.startedDate,
        }
    }
}
