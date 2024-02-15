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
    QueueFinished = 'QueueFinished',
    Paused = 'Paused',
    Finishing = 'Finishing',
    Finished = 'Finished',
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
    QueueFinished = 'queueFinished',
    Paused = 'paused',
    Finishing = 'finishing',
    Finished = 'finished',
    Canceling = 'canceling',
    Canceled = 'canceled',
    Error = 'error',
}