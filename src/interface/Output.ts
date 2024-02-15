import { UploaderStatus } from '../SmashUploader';
import { Status, Region, UploadState, Preview } from './Transfer';

export interface UploadCanceledOutput {
    status: UploaderStatus,
    transfer?: {
        id?: string,
        status?: Status,
        region?: Region,
        transferUrl?: string,
        uploadState?: UploadState,
        availabilityEndDate?: string,
        availabilityDuration?: number,
        availabilityStartDate?: string,
        size?: number,
        preview?: Preview,
        created?: string,
        modified?: string,
        filesNumber?: number,
    }
}

export interface UploadPausedOutput {
    status: UploaderStatus,
    transfer: {
        id: string,
        status: Status,
        region: Region,
        transferUrl: string,
        uploadState: UploadState,
        availabilityDuration: number,
        size: number,
        preview: Preview,
        created: string,
        modified: string,
        filesNumber: number,
        queue?: number;
        queuedUntil?: string,
    }
}

export interface UploadResumedOutput {
    status: UploaderStatus,
    transfer: {
        id: string,
        status: Status,
        region: Region,
        transferUrl: string,
        uploadState: UploadState,
        availabilityDuration: number,
        size: number,
        preview: Preview,
        created: string,
        modified: string,
        filesNumber: number,
        queue?: number;
        queuedUntil?: string,
    }
}


export interface UploadCompleteOutput {
    status: UploaderStatus,
    transfer: {
        id: string,
        status: Status,
        region: Region,
        transferUrl: string,
        uploadState: UploadState,
        availabilityEndDate: string,
        availabilityDuration: number,
        availabilityStartDate: string,
        size: number,
        preview: Preview,
        created: string,
        modified: string,
        filesNumber: number,
    }
}

export interface UpdateOutput {
    transfer: {
        id: string,
        status: Status,
        region: Region,
        transferUrl: string,
        uploadState: UploadState,
        availabilityDuration: number,
        size: number,
        preview: Preview,
        created: string,
        modified: string,
        filesNumber: number,
    }
}