import { CustomEvent } from '../core/CustomEventEmitter';

export interface UploadProgress {
    totalBytes: number;
    uploadedBytes: number;
    percent: number;
    speed: number;
    estimatedTime: number;
    remainingTime: number;
}
export class UploadProgressEvent implements CustomEvent {
    public name = 'progress';
    public lastUploadProgressEvent?: UploadProgressEvent;
    public totalBytes: number;
    public uploadedBytes: number;
    public percent: number;
    public speed: number;
    public estimatedTime: number;
    public remainingTime: number;

    constructor({ totalBytes, uploadedBytes, percent, speed, estimatedTime, remainingTime }: UploadProgress) {
        this.totalBytes = totalBytes;
        this.uploadedBytes = uploadedBytes;
        this.percent = percent;
        this.speed = speed;
        this.estimatedTime = estimatedTime;
        this.remainingTime = remainingTime;
    }

    get data(): UploadProgress {
        return {
            speed: this.speed,
            estimatedTime: this.estimatedTime,
            remainingTime: this.remainingTime,
            percent: this.percent,
            totalBytes: this.totalBytes,
            uploadedBytes: this.uploadedBytes,
        }
    }
}
