import { Status, Region, UploadState, Preview } from './Transfer';

export interface UploadCanceledOutput {
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
export interface UploadCompleteOutput {
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

// TODO FIX ME rework some property of this interface
//import { UpdateTransferOutput } from '@smash-sdk/transfer/10-2019/types/UpdateTransfer/UpdateTransfer';
export interface UpdateOutput {
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