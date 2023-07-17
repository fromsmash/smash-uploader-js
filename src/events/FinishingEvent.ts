import { CustomEvent } from '../core/CustomEventEmitter';
import { Transfer } from '../core/Transfer';

export interface FinishingEventInput {
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
    finishingDate: string;
}

export interface FinishingEventData {
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
    finishingDate: string;
}

export class FinishingEvent implements CustomEvent {
    public name = 'finishing';
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
    public finishingDate: string;

    constructor({ transfer, finishingDate }: FinishingEventInput) {
        this.transfer = transfer;
        this.finishingDate = finishingDate;
    }

    get data(): FinishingEventData {
        return {
            transfer: this.transfer,
            finishingDate: this.finishingDate,
        }
    }
}
