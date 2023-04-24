export interface UploadOutput {
    transfer: {
        id: string,
        status: string,
        region: string,
        transferUrl: string,
        uploadState: string,
        availabilityEndDate: string,
        availabilityDuration: number,
        availabilityStartDate: string,
        size: number,
        preview: any,
        created: string,
        modified: string,
        filesNumber: number
    }
}