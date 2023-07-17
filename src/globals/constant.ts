export enum ConnectionEvents {
    ConnectionAvailable = 'ConnectionAvailable',
    ConnectionBusy = 'ConnectionBusy',
    ConnectionProgress = 'ConnectionProgress',
}

export enum UploaderStatus {
    Pending = 'Pending',
    Starting = 'Starting',
    Started = 'Started',
    Queued = 'Queued',
    Uploading = 'Uploading',
    Finishing = 'Finishing',
    Finished = 'Finished',
    Aborting = 'Aborting',
    Aborted = 'Aborted',
    Canceling = 'Canceling',
    Canceled = 'Canceled',
    Error = 'Error',
}

export enum UploaderEvents {
    Changes = 'changes',
    Pending = 'pending',
    Starting = 'starting',
    Started = 'started',
    Progress = 'progress',
    Queued = 'queued',
    Uploading = 'uploading',
    Finishing = 'finishing',
    Finished = 'finished',
    Aborting = 'aborting',
    Aborted = 'aborted',
    Canceling = 'canceling',
    Canceled = 'canceled',
    Error = 'error',
}