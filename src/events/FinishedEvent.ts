import { CustomEvent } from '../core/CustomEventEmitter';

export interface FinishedEventInput {
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
    finishedDate: string;
    startedDate: string;
}

export class FinishedEvent implements CustomEvent {
    public name = 'finished';
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
    public duration: number;
    public startedDate: string;
    public finishedDate: string;

    constructor({
        transfer: {
            id,
            status,
            region,
            transferUrl,
            uploadState,
            availabilityEndDate,
            availabilityDuration,
            availabilityStartDate,
            preview,
            created,
            modified,
            size,
            filesNumber,
        },
        startedDate,
        finishedDate
    }: FinishedEventInput) {
        this.transfer = {
            id,
            status,
            region,
            transferUrl,
            uploadState,
            availabilityEndDate,
            availabilityDuration,
            availabilityStartDate,
            preview,
            created,
            modified,
            size,
            filesNumber,
        };
        this.startedDate = startedDate;
        this.finishedDate = finishedDate;
        this.duration = new Date(this.finishedDate).getTime() - new Date(this.startedDate).getTime();
    }

    get data() {
        return {
            transfer: this.transfer,
            finishedDate: this.finishedDate,
            duration: new Date(this.finishedDate).getTime() - new Date(this.startedDate).getTime(),
        }
    }
}
