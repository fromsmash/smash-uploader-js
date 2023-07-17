import { CustomEvent } from '../core/CustomEventEmitter';
import { Transfer } from '../core/Transfer';

export interface UploadProgressEventInput {
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
    uploadedBytes: number;
    percent: number;
    speed: number;
    estimatedTime: number;
    remainingTime: number;
}
export class UploadProgressEvent implements CustomEvent {
    public name = 'progress';
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
    public lastUploadProgressEvent?: UploadProgressEvent;
    public uploadedBytes: number;
    public percent: number;
    public speed: number;
    public estimatedTime: number;
    public remainingTime: number;

    constructor({ transfer, uploadedBytes, percent, speed, estimatedTime, remainingTime }: UploadProgressEventInput) {
        this.transfer = transfer;
        this.uploadedBytes = uploadedBytes;
        this.percent = percent;
        this.speed = speed;
        this.estimatedTime = estimatedTime;
        this.remainingTime = remainingTime;
    }

    get data() {
        return {
            speed: this.speed,
            estimatedTime: this.estimatedTime,
            remainingTime: this.remainingTime,
            percent: this.percent,
            totalBytes: this.transfer.size,
            uploadedBytes: this.uploadedBytes,
        }
    }
}
