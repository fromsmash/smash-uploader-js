import { errors, Transfer as TransferSdk } from '@smash-sdk/transfer/01-2024';
import { UploaderStatus } from '../globals/constant';
import { UploadInput, UpdateInput } from '../interface/Input';
import { UploaderParameters } from '../interface/UploaderParameters';
import { CreateFile } from '../modules/tasks/CreateFile';
import { CreateParts } from '../modules/tasks/CreateParts';
import { CreateTransfer } from '../modules/tasks/CreateTransfer';
import { LockTransfer } from '../modules/tasks/LockTransfer';
import { Task } from '../modules/tasks/Task';
import { UpdateFile } from '../modules/tasks/UpdateFile';
import { UpdateParts } from '../modules/tasks/UpdateParts';
import { UploadPart } from '../modules/tasks/UploadPart';
import { Files } from './Files';
import { Logger } from './Logger';
import { Queue } from './Queue';
import { Transfer } from './Transfer';
import { UpdateOutput } from '../interface/Output';
import { TransferAlreadyStartingError, TransferAlreadyFinishingError, TransferAlreadyFinishedError, TransferAlreadyCancelingError, TransferAlreadyCanceledError, TransferIsInErrorError, UnknownError, InvalidParameterError, NetworkError, TransferNotFoundError } from '../errors/errors';
import { UploaderError } from '../SmashUploader';
import { Preview, Region, Status, UploadState } from '../interface/Transfer';

export interface Queues {
    taskQueue: Queue<Task>,
    createTransferQueue: Queue<CreateTransfer>,
    createFileQueue: Queue<CreateFile>,
    createPartsQueue: Queue<CreateParts>,
    uploadPartQueue: Queue<UploadPart>,
    updatePartsQueue: Queue<UpdateParts>,
    updateFileQueue: Queue<UpdateFile>,
    lockTransferQueue: Queue<LockTransfer>,
}

export interface StartingContext extends Context {
    startingDate: string;
    //status
}

export interface StartedContext extends Context {
    startedDate: string;
    //status
    //TODO FIX ME create CreatedTransfer interface 
    transfer: Transfer &
    {
        id: string,
        region: Region,
        status: Status,
        preview: Preview,
        transferUrl: string,
        uploadState: UploadState,
        created: string,
        availabilityDuration: number,
        queue: number,//TODO FIX ME is this used?
        queuedUntil: string,
    };
}

export interface QueuedContext extends Context {
    queuedDate: string;
    //status
    transfer: Transfer &
    {
        id: string,
        region: Region,
        status: Status,
        preview: Preview,
        transferUrl: string,
        uploadState: UploadState,
        created: string,
        availabilityDuration: number,
        queue: number,//TODO FIX ME is this used?
        queuedUntil: string,
    };
}
export interface QueueFinishedContext extends Context {
    queueFinishedDate: string;
    //status
    transfer: Transfer &
    {
        id: string,
        region: Region,
        status: Status,
        preview: Preview,
        transferUrl: string,
        uploadState: UploadState,
        created: string,
        availabilityDuration: number,
        queue: number,//TODO FIX ME is this used?
        queuedUntil: string,
    };
}

export interface PausedContext extends Context {
    pausedDate: string;
    //status
    transfer: Transfer &
    {
        id: string,
        region: Region,
        status: Status,
        preview: Preview,
        transferUrl: string,
        uploadState: UploadState,
        created: string,
        availabilityDuration: number,
        queue: number,//TODO FIX ME is this used?
        queuedUntil: string,
    };
}

export interface FinishingContext extends Context {
    finishingDate: string;
    //status
    transfer: Transfer &
    {
        id: string,
        region: Region,
        status: Status,
        preview: Preview,
        transferUrl: string,
        uploadState: UploadState,
        created: string,
        availabilityDuration: number,
        queue: number,//TODO FIX ME is this used?
        queuedUntil: string,
    };
}

export interface FinishedContext extends Context {
    finishedDate: string;
    startedDate: string;
    //status
    transfer: Transfer &
    {
        id: string,
        region: Region,
        status: Status,
        preview: Preview,
        transferUrl: string,
        uploadState: UploadState,
        created: string,
        availabilityDuration: number,
        queue: number,//TODO FIX ME is this used?
        queuedUntil: string,
        availabilityEndDate: string,
        availabilityStartDate: string,
    };
}

export interface CancelContext extends Context {
    cancelDate: string;
    //status
    transfer: Transfer &
    {
        id: string,
        region: Region,
        status: Status,
        preview: Preview,
        transferUrl: string,
        uploadState: UploadState,
        created: string,
        availabilityDuration: number,
        queue: number,//TODO FIX ME is this used?
        queuedUntil: string,
    };
}

export class Context {// FIX ME change to UploaderParameters class which does sanity check
    readonly logger: Logger;
    public transferSdk: TransferSdk;
    public uploaderParameters: UploaderParameters;

    public lastValueUploadedBytes = 0;
    public speed = 0;
    public remainingTime = 0;
    public estimatedTime = 0;
    public percent = 0;

    public transfer?: Transfer;
    public startingDate?: string;
    public startedDate?: string;
    public queuedDate?: string;
    public localEndOfQueueTimestamp?: number;
    public queueFinishedDate?: string;
    public pausedDate?: string;
    public uploadingDate?: string;
    public finishingDate?: string;
    public finishedDate?: string;
    public cancelDate?: string;

    public localQueuedUntilDate?: string;

    public status: UploaderStatus = UploaderStatus.Pending;

    public taskQueue = new Queue<Task>();
    public createTransferQueue = new Queue<CreateTransfer>();
    public createFileQueue = new Queue<CreateFile>();
    public createPartsQueue = new Queue<CreateParts>();
    public uploadPartQueue = new Queue<UploadPart>();
    public updateFileQueue = new Queue<UpdateFile>();
    public updatePartsQueue = new Queue<UpdateParts>();
    public lockTransferQueue = new Queue<LockTransfer>();


    constructor(uploaderParameters: UploaderParameters) {
        //TODO sanity check uploaderParameters
        this.uploaderParameters = uploaderParameters;
        this.logger = new Logger(uploaderParameters.verboseLevel);
        this.transferSdk = new TransferSdk({
            region: uploaderParameters.region,
            token: uploaderParameters.token,
            refreshTokenMethod: uploaderParameters.refreshTokenMethod,
        });
    }

    public createTransfer(transferParameters: UploadInput): Context {
        //TODO FIX ME this value transferParameters can be undefined => make something to manage it and set default values
        // for exemple with an object
        this.transfer = new Transfer(transferParameters);
        this.createTransferQueue.add(new CreateTransfer(this));
        return this;
    }

    public updateTransfer(params: UpdateInput): Promise<UpdateOutput> {
        //TODO FIX ME this value transferParameters can be undefined => make something to manage it and set default values
        // for exemple with an object
        return new Promise(async (resolve, reject) => {
            try {
                if (this.status === UploaderStatus.Finished) {
                    throw new TransferAlreadyFinishedError('Unable to update transfer, upload is finished.');
                }
                if (params?.files) {
                    if (this.status === UploaderStatus.Starting) {
                        throw new TransferAlreadyStartingError('Unable to update transfer files, upload is starting.');
                    }
                    if (this.status === UploaderStatus.Started) {
                        throw new TransferAlreadyStartingError('Unable to update transfer files, upload is started.');
                    }
                    if (this.status === UploaderStatus.Finishing) {
                        throw new TransferAlreadyFinishingError('Unable to update transfer files, upload is finishing.');
                    }
                    if (this.status === UploaderStatus.Canceling) {
                        throw new TransferAlreadyCancelingError('Unable to update transfer files, upload is canceling.');
                    }
                    if (this.status === UploaderStatus.Canceled) {
                        throw new TransferAlreadyCanceledError('Unable to update transfer files, upload is canceled.');
                    }
                    if (this.status === UploaderStatus.Error) {
                        throw new TransferIsInErrorError('Unable to update transfer files, upload is in error.');
                    }
                    this.transfer!.files = new Files(params.files);
                    this.createFileQueue = new Queue<CreateFile>();
                    this.transfer!.files.forEach(file => {
                        this.createFileQueue.add(new CreateFile(this, file));
                    });
                }

                const response = await this.transferSdk.updateTransfer({ transferId: this.transfer!.id!, ...params, size: this.transfer?.files.size, filesNumber: this.transfer?.files.length });
                this.transfer!.populateUpdatedTransfer(response);
                this.localEndOfQueueTimestamp = Date.now() + this.transfer!.queue! * 1000;
                resolve({
                    transfer: {
                        id: response.transfer.id,
                        status: response.transfer.status,
                        region: response.transfer.region,
                        transferUrl: response.transfer.transferUrl,
                        uploadState: response.transfer.uploadState,
                        availabilityDuration: response.transfer.availabilityDuration,
                        size: response.transfer.size,
                        preview: response.transfer.preview,
                        created: response.transfer.created,
                        modified: response.transfer.modified,
                        filesNumber: response.transfer.filesNumber,
                    }
                });
            } catch (error) {
                if (error instanceof errors.UpdateTransfer.TransferAlreadyLockedError) {
                    reject(new InvalidParameterError(error));
                }
                if (error instanceof errors.UpdateTransfer.TransferAlreadyLockedError) {
                    reject(new TransferAlreadyFinishedError(error));
                }
                if (error instanceof errors.UpdateTransfer.InternalServerError
                    || error instanceof errors.UpdateTransfer.BadGatewayError
                    || error instanceof errors.UpdateTransfer.NetworkError
                    || error instanceof errors.UpdateTransfer.GatewayTimeoutError
                    || error instanceof errors.UpdateTransfer.UnknownError) {
                    reject(new UploaderError(error));
                }
                if (error instanceof errors.UpdateTransferError.NotFoundError) {
                    reject(new TransferNotFoundError(error));
                }
                reject(error);
            }
        })
    }

    public cancel(): CancelContext {
        this.status = UploaderStatus.Canceling;
        this.cancelDate = new Date().toISOString();
        return this as CancelContext;
    }

    public starting(): StartingContext {
        this.status = UploaderStatus.Starting;
        this.startingDate = new Date().toISOString();
        return this as StartingContext;
    }

    public started(): StartedContext {
        this.status = UploaderStatus.Started;
        this.startedDate = new Date().toISOString();
        return this as StartedContext;
    }

    public queued(): QueuedContext {
        this.status = UploaderStatus.Queued;
        this.queuedDate = new Date().toISOString();
        return this as QueuedContext;
    }

    public queueFinished(): QueueFinishedContext {
        this.status = UploaderStatus.QueueFinished;
        this.queueFinishedDate = new Date().toISOString();
        return this as QueueFinishedContext;
    }

    public paused(): PausedContext {
        this.status = UploaderStatus.Paused;
        this.pausedDate = new Date().toISOString();
        return this as PausedContext;
    }

    public finishing(): FinishingContext {
        this.status = UploaderStatus.Finishing;
        this.finishingDate = new Date().toISOString();
        return this as FinishingContext;
    }

    public finished(): FinishedContext {
        this.status = UploaderStatus.Finished;
        this.finishedDate = new Date().toISOString();
        return this as FinishedContext;
    }

    public error(): Context {
        this.status = UploaderStatus.Error;
        return this;
    }

    public isStarted(): boolean {
        return this.status === UploaderStatus.Started;
    }

    public isFinished(): boolean {
        return this.status === UploaderStatus.Finished;
    }

    public isCanceled(): boolean {
        return this.status === UploaderStatus.Canceling || this.status === UploaderStatus.Canceled;
    }

    public isOnError(): boolean {
        return this.status === UploaderStatus.Error;
    }

    public isPaused(): boolean {
        return this.status === UploaderStatus.Paused;
    }

    public isQueued(): boolean {
        return this.status === UploaderStatus.Queued;
    }

    public isQueueFinished(): boolean {
        return this.status === UploaderStatus.QueueFinished;
    }

    public hasQueue(): boolean {
        return typeof this.transfer?.queue === "number" && this.transfer.queue > 0;
    }

    public unrecoverableUploadError(): Context {
        this.status = UploaderStatus.Error;
        return this;
    }

    public onError(): boolean {
        return this.status === UploaderStatus.Error;
    }

    public shouldStopProcessTask(): boolean {
        return this.isPaused() || this.isCanceled() || this.onError();
    }

    public getStatus(): UploaderStatus {
        return this.status;
    }

    public queues(): Queues {
        return {
            taskQueue: this.taskQueue,
            createTransferQueue: this.createTransferQueue,
            createFileQueue: this.createFileQueue,
            createPartsQueue: this.createPartsQueue,
            uploadPartQueue: this.uploadPartQueue,
            updateFileQueue: this.updateFileQueue,
            updatePartsQueue: this.updatePartsQueue,
            lockTransferQueue: this.lockTransferQueue,
        };
    }

    public get uploadedBytes(): number {
        if (this.transfer) {
            const a = this.transfer.filesCompleted.size;
            const b = this.transfer.filesProcessing.list().reduce((prev, curr) => prev + curr.partsToUpload.sizeUploaded + curr.inlinePartsToComplete.size + curr.partsToComplete.size + curr.completingParts.size + curr.partsCompleted.size, 0);
            return a + b;
        }
        return 0;
    }

    public reset() {
        this.transfer = undefined;
        this.status = UploaderStatus.Pending;
        this.taskQueue = new Queue<Task>();
        this.createTransferQueue = new Queue<CreateTransfer>();
        this.createFileQueue = new Queue<CreateFile>();
        this.createPartsQueue = new Queue<CreateParts>();
        this.uploadPartQueue = new Queue<UploadPart>();
        this.updateFileQueue = new Queue<UpdateFile>();
        this.updatePartsQueue = new Queue<UpdateParts>();
        this.lockTransferQueue = new Queue<LockTransfer>();
        this.startingDate = undefined;
        this.startedDate = undefined;
        this.uploadingDate = undefined;
        this.finishingDate = undefined;
        this.finishedDate = undefined;
        this.cancelDate = undefined;
        this.lastValueUploadedBytes = 0;
        this.speed = 0;
        this.remainingTime = 0;
        this.estimatedTime = 0;
        this.percent = 0;
    }
}
