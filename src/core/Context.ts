import { Transfer as TransferSdk } from '@smash-sdk/transfer/10-2019';
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
    public uploadingDate?: string;
    public finishingDate?: string;
    public finishedDate?: string;
    public cancelDate?: string;

    public status: UploaderStatus = UploaderStatus.Pending; //FIX ME TODO initial status? if status id can

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
                this.transfer!.files = new Files(params.files);
                this.createFileQueue = new Queue<CreateFile>();
                this.transfer!.files.forEach(file => {
                    this.createFileQueue.add(new CreateFile(this, file));
                });
                const response = await this.transferSdk.updateTransfer({ transferId: this.transfer!.id!, ...params });
                this.transfer!.populateUpdatedTransfer(response);
                resolve({
                    transfer: {
                        id: response.transfer.id,
                        status: response.transfer.status,
                        region: response.transfer.region,
                        transferUrl: response.transfer.transferUrl,
                        uploadState: response.transfer.uploadState,
                        availabilityEndDate: response.transfer.availabilityEndDate,
                        availabilityDuration: response.transfer.availabilityDuration,
                        availabilityStartDate: response.transfer.availabilityStartDate,
                        size: response.transfer.size,
                        preview: response.transfer.preview,
                        created: response.transfer.created,
                        modified: response.transfer.modified,
                        filesNumber: response.transfer.filesNumber,
                    }
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    //FIX ME Aborted && aborting or only one status is usefull?
    public cancel(): Context {
        this.status = UploaderStatus.Canceling;
        this.cancelDate = new Date().toISOString();
        return this;
    }

    // FIX ME is this usefull dual status?
    public starting(): Context {
        this.status = UploaderStatus.Starting;
        this.startingDate = new Date().toISOString();
        return this;
    }

    // FIX ME is this usefull dual status?
    public started(): Context {
        this.status = UploaderStatus.Started;
        this.startedDate = new Date().toISOString();
        return this;
    }

    public queued(): Context {  
        this.status = UploaderStatus.Queued;
        this.queuedDate = new Date().toISOString();
        return this;
    }

    public uploading(): Context {
        this.status = UploaderStatus.Uploading;
        this.uploadingDate = new Date().toISOString();
        return this;
    }

    //FIX ME usefull to have dual status finishing and finished
    public finishing(): Context {
        this.status = UploaderStatus.Finishing;
        this.finishingDate = new Date().toISOString();
        return this;
    }

    //FIX ME usefull to have dual status finishing and finished
    public finished(): Context {
        this.status = UploaderStatus.Finished;
        this.finishedDate = new Date().toISOString();
        return this;
    }

    public error(): Context {
        this.status = UploaderStatus.Error;
        return this;
    }

    public isFinished(): boolean { //FIX ME dual status is usefull or not?
        return this.status === UploaderStatus.Finished;
    }

    public isCanceled(): boolean { //FIX ME dual status is usefull or not?
        return this.status === UploaderStatus.Canceling || this.status === UploaderStatus.Canceled;
    }

    public unrecoverableUploadError(): Context {
        this.status = UploaderStatus.Error;
        return this;
    }

    public onError(): boolean {
        return this.status === UploaderStatus.Error;
    }

    public shouldStopProcessTask(): boolean {
        return this.isCanceled() || this.onError();
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
