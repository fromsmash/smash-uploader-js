import { UpdateTransferOutput } from '@smash-sdk/transfer/10-2019';
import { Context } from './core/Context';
import { CustomEventEmitter } from './core/CustomEventEmitter';
import { ConnectionAvailableEvent } from './events/ConnectionAvailableEvent';
import { ConnectionBusyEvent } from './events/ConnectionBusyEvent';
import { UploadProgressEvent } from './events/UploadProgressEvent';
import { ConnectionEvents, UploaderEvents, UploaderStatus } from './globals/constant';
import { UploaderError } from './helpers/errors';
import { UploadOutput } from './interface/UploadOutput';
import { UploadInput, UpdateTransferInput } from './interface/TransferParameters';
import { UploaderParameters } from './interface/UploaderParameters';
import { Connection } from './modules/handlers/Connection';
import { Connections } from './modules/handlers/Connections';
import { Sequencer } from './modules/Sequencer';
import { Task } from './modules/tasks/Task';

export { UploaderEvents } from './globals/constant';

export class SmashUploader extends CustomEventEmitter {
    private readonly initiaParallelConnections = 1;
    private connections: Connections;
    private sequencer: Sequencer;
    private context: Context;
    private transferPromise!: { resolve: (value: UploadOutput) => void, reject: (error: Error) => void };
    private progressTimer?: NodeJS.Timer;
    private speedTimer?: NodeJS.Timer;
    private queueTimer?: NodeJS.Timer;

    constructor(uploaderParameters: UploaderParameters) {
        super();
        this.context = new Context(uploaderParameters);
        this.connections = new Connections();
        this.sequencer = new Sequencer();
        this.bindConnections();
        //FIX ME call a function reset() witch recreate everything
        //this.reset(); FIX ME this is not working....
    }

    private bindConnections(): SmashUploader {
        this.connections.on(ConnectionEvents.ConnectionAvailable, (event: ConnectionAvailableEvent) => this.handleConnectionAvailable(this, event));
        this.connections.on(ConnectionEvents.ConnectionBusy, this.handleConnectionBusy);
        return this;
    }

    private reset(): SmashUploader {
        this.resetTimers();
        this.connections.off();
        this.connections = new Connections();
        this.bindConnections();
        //TODO create reset context
        this.context.reset();
        return this;
    }

    private emitStarting() {
        this.context.starting();
        this.emit(UploaderEvents.Starting, {
            name: UploaderEvents.Starting,
            data: {
                transfer: {
                    id: this.context.transfer!.id,
                    status: this.context.transfer!.status,
                    region: this.context.transfer!.region,
                    transferUrl: this.context.transfer!.transferUrl,
                    uploadState: this.context.transfer!.uploadState,
                    availabilityEndDate: this.context.transfer!.availabilityEndDate,
                    availabilityDuration: this.context.transfer!.availabilityDuration,
                    availabilityStartDate: this.context.transfer!.availabilityStartDate,
                    size: this.context.transfer!.size,
                    preview: this.context.transfer!.preview,
                    created: this.context.transfer!.created,
                    modified: this.context.transfer!.modified,
                    filesNumber: this.context.transfer!.filesNumber,
                },
                startingDate: this.context.startingDate,
            }
        });
    }

    private emitQueue() {
        this.emit(UploaderEvents.Queued, {
            name: UploaderEvents.Queued,
            data: {
                transfer: {
                    id: this.context.transfer!.id,
                    status: this.context.transfer!.status,
                    region: this.context.transfer!.region,
                    transferUrl: this.context.transfer!.transferUrl,
                    uploadState: this.context.transfer!.uploadState,
                    availabilityEndDate: this.context.transfer!.availabilityEndDate,
                    availabilityDuration: this.context.transfer!.availabilityDuration,
                    availabilityStartDate: this.context.transfer!.availabilityStartDate,
                    size: this.context.transfer!.size,
                    preview: this.context.transfer!.preview,
                    created: this.context.transfer!.created,
                    modified: this.context.transfer!.modified,
                    filesNumber: this.context.transfer!.filesNumber,
                },
            }
        });
    }

    private emitStarted() {
        this.context.started();
        this.emit(UploaderEvents.Started, {
            name: UploaderEvents.Started,
            data: {
                transfer: {
                    id: this.context.transfer!.id,
                    status: this.context.transfer!.status,
                    region: this.context.transfer!.region,
                    transferUrl: this.context.transfer!.transferUrl,
                    uploadState: this.context.transfer!.uploadState,
                    availabilityEndDate: this.context.transfer!.availabilityEndDate,
                    availabilityDuration: this.context.transfer!.availabilityDuration,
                    availabilityStartDate: this.context.transfer!.availabilityStartDate,
                    size: this.context.transfer!.size,
                    preview: this.context.transfer!.preview,
                    created: this.context.transfer!.created,
                    modified: this.context.transfer!.modified,
                    filesNumber: this.context.transfer!.filesNumber,
                },
                startedDate: this.context.startedDate,
            }
        });
    }

    private emitProgress() {
        const progressEvent = new UploadProgressEvent({
            speed: this.context.speed,
            estimatedTime: this.context.estimatedTime,
            remainingTime: this.context.remainingTime,
            percent: this.context.percent,
            totalBytes: this.context.transfer!.size,
            uploadedBytes: this.context.uploadedBytes,
        });
        this.emit(UploaderEvents.Progress, { name: UploaderEvents.Progress, data: { progress: progressEvent.data } });
    }

    private emitFinishing() {
        this.emit(UploaderEvents.Finishing,
            {
                name: UploaderEvents.Finishing,
                data: {
                    transfer: {
                        id: this.context.transfer!.id,
                        status: this.context.transfer!.status,
                        region: this.context.transfer!.region,
                        transferUrl: this.context.transfer!.transferUrl,
                        uploadState: this.context.transfer!.uploadState,
                        availabilityEndDate: this.context.transfer!.availabilityEndDate,
                        availabilityDuration: this.context.transfer!.availabilityDuration,
                        availabilityStartDate: this.context.transfer!.availabilityStartDate,
                        size: this.context.transfer!.size,
                        preview: this.context.transfer!.preview,
                        created: this.context.transfer!.created,
                        modified: this.context.transfer!.modified,
                        filesNumber: this.context.transfer!.filesNumber,
                    },
                }
            }
        );
    }

    private emitFinished() {
        this.resetTimers();
        this.emit(UploaderEvents.Finished, {
            name: UploaderEvents.Finished,
            data: {
                transfer: {
                    id: this.context.transfer!.id,
                    status: this.context.transfer!.status,
                    region: this.context.transfer!.region,
                    transferUrl: this.context.transfer!.transferUrl,
                    uploadState: this.context.transfer!.uploadState,
                    availabilityEndDate: this.context.transfer!.availabilityEndDate,
                    availabilityDuration: this.context.transfer!.availabilityDuration,
                    availabilityStartDate: this.context.transfer!.availabilityStartDate,
                    size: this.context.transfer!.size,
                    preview: this.context.transfer!.preview,
                    created: this.context.transfer!.created,
                    modified: this.context.transfer!.modified,
                    filesNumber: this.context.transfer!.filesNumber,
                },
                startedDate: this.context.startedDate,
                finishedDate: this.context.finishedDate,
                duration: new Date(this.context.finishedDate!).getTime() - new Date(this.context.startedDate!).getTime(),
            }
        });
        this.transferPromise.resolve({
            transfer: {
                id: this.context.transfer!.id,
                status: this.context.transfer!.status,
                region: this.context.transfer!.region,
                transferUrl: this.context.transfer!.transferUrl as string,
                uploadState: this.context.transfer!.uploadState as string,
                availabilityEndDate: this.context.transfer!.availabilityEndDate as string,
                availabilityDuration: this.context.transfer!.availabilityDuration as number,
                availabilityStartDate: this.context.transfer!.availabilityStartDate as string,
                size: this.context.transfer!.size,
                preview: this.context.transfer!.preview,
                created: this.context.transfer!.created as string,
                modified: this.context.transfer!.modified as string,
                filesNumber: this.context.transfer!.filesNumber,
            }
        });
    }

    private emitError(error: unknown) {
        this.emit(UploaderEvents.Error, error as any); //FIX ME type is TaskError or Error type
        this.reset();
        this.transferPromise.reject(error as Error);
    }

    private emitCanceled() {
        this.emit(UploaderEvents.Canceled, {
            name: UploaderEvents.Canceled,
            data: {
                transfer: {
                    id: this.context.transfer!.id,
                    status: this.context.transfer!.status,
                    region: this.context.transfer!.region,
                    transferUrl: this.context.transfer!.transferUrl,
                    uploadState: this.context.transfer!.uploadState,
                    availabilityEndDate: this.context.transfer!.availabilityEndDate,
                    availabilityDuration: this.context.transfer!.availabilityDuration,
                    availabilityStartDate: this.context.transfer!.availabilityStartDate,
                    size: this.context.transfer!.size,
                    preview: this.context.transfer!.preview,
                    created: this.context.transfer!.created,
                    modified: this.context.transfer!.modified,
                    filesNumber: this.context.transfer!.filesNumber,
                },
            },
        });
        this.transferPromise.resolve({
            transfer: {
                id: this.context.transfer!.id,
                status: this.context.transfer!.status,
                region: this.context.transfer!.region,
                transferUrl: this.context.transfer!.transferUrl as string,
                uploadState: this.context.transfer!.uploadState as string,
                availabilityEndDate: this.context.transfer!.availabilityEndDate as string,
                availabilityDuration: this.context.transfer!.availabilityDuration as number,
                availabilityStartDate: this.context.transfer!.availabilityStartDate as string,
                size: this.context.transfer!.size,
                preview: this.context.transfer!.preview,
                created: this.context.transfer!.created as string,
                modified: this.context.transfer!.modified as string,
                filesNumber: this.context.transfer!.filesNumber,
            }
        });
        this.reset();
    }

    private emitQueueIfNeeded() {
        if (new Date(this.context.transfer!.queuedUntil as string).getTime() > new Date().getTime()) {
            this.emitQueue();
        }
    }

    private startTask(connection: Connection, task: Task): void {
        if (this.context.shouldStopProcessTask() === false) {
            const preProcessedTask = task.preProcess(this.context);
            //FIX ME check if transfer aborted if yes  ignore the next steps
            if (preProcessedTask) {
                if (preProcessedTask.isLastTask()) {
                    this.emitFinishing();
                }
                this.processTask(connection, preProcessedTask);
            }
        }
    }

    private processTask(connection: Connection, task: Task): void {
        connection.execute(task).then(processedTask => {
            //FIX ME check if transfer aborted if yes  ignore the next steps
            if (processedTask.isOnError()) {
                this.handleConnectionError(processedTask);
            } else {
                const nextTask = processedTask.postProcess(this.context);
                if (processedTask.isFirstTask()) {
                    this.emitQueueIfNeeded();
                    this.addConnections(this.context.transfer!.parallelConnections);
                } else if (processedTask.isLastTask()) {
                    this.emitFinished();
                }
                //FIX ME check if transfer aborted if yes  ignore the next steps
                if (nextTask) {
                    if (nextTask.isLastTask()) {
                        this.emitFinished();
                    } else {
                        this.startTask(connection, nextTask);
                    }
                } else {
                    this.pingConnections();
                }
            }
        });
    }

    private handleConnectionAvailable(uploader: this, event: ConnectionAvailableEvent): void {
        const connection = uploader.connections.get(event.connectionId);
        const nextTask = uploader.sequencer.evaluateNextTask(this.context);
        if (nextTask) {
            uploader.startTask(connection, nextTask);
        }
    }

    private handleConnectionBusy(event: ConnectionBusyEvent): void {
        const task = event.getTask();
        if (task) {
            this.context.taskQueue.add(task);
        }
    }

    private handleConnectionError(task: Task): void {
        const error = task.processError();
        if (error.shouldAbortUpload()) {
            this.context.unrecoverableUploadError();
            //TODO FIX ME
            //handle correctly the error unrecoverable status of upload
            this.emitError(error);//FIX ME parameters?
        } else {
            const recoveryTask = error.getRecoveryTask();
            if (recoveryTask) {
                this.context.taskQueue.add(recoveryTask);
            }
            this.pingConnections();
        }
    }

    private pingConnectionsAroundQueue() {
        if (this.context?.transfer?.queuedUntil) {
            const diff = new Date(this.context.transfer.queuedUntil).getTime() - new Date().getTime();
            if (diff >= -60000 && diff <= 60000) {
                this.pingConnections();
                if (this.context.getStatus() !== UploaderStatus.Started) {
                    this.emitStarted();
                }
                this.endQueueTimer();
            }
        }
    }

    private computePercent() {
        if (this.context?.transfer?.size && this.context?.transfer?.size > 0) {
            this.context.percent = Math.round((this.context.uploadedBytes / this.context.transfer.size) * 100);
        }
    }

    private computeSpeed() {
        this.context.speed = this.context.uploadedBytes - this.context.lastValueUploadedBytes;
        this.context.lastValueUploadedBytes = this.context.uploadedBytes;
    }

    private computeEstimatedTime() {
        if (this.context.transfer && this.context.speed > 0) {
            this.context.estimatedTime = (this.context.transfer.size / this.context.speed) * 1000;
        }
    }

    private computeRemainingTime() {
        if (this.context.transfer && this.context.speed > 0) {
            this.context.remainingTime = ((this.context.transfer.size - this.context.uploadedBytes) / this.context.speed) * 1000;
        }
    }

    private startSpeedTimer() {
        this.speedTimer = setInterval(() => {
            this.computeSpeed();
            this.computeEstimatedTime();
            this.computeRemainingTime();
        }, 1000);
    }

    private startProgressTimer() {
        this.progressTimer = setInterval(() => {
            this.computePercent();
            this.emitProgress();
        }, 100);
    }

    private startQueueTimer() {
        this.queueTimer = setInterval(() => {
            this.pingConnectionsAroundQueue();
        }, 100);
    }

    private endProgressTimer() {
        clearInterval(this.progressTimer);
    }

    private endSpeedTimer() {
        clearInterval(this.speedTimer);
    }

    private endQueueTimer() {
        clearInterval(this.queueTimer);
    }

    private resetTimers() {
        this.endProgressTimer();
        this.endSpeedTimer();
        this.endQueueTimer();
    }

    private pingConnections(): SmashUploader {
        this.connections.ping();
        return this;
    }

    private addConnections(count: number): SmashUploader {
        const newConnections = this.connections.updateConnectionNumber(count);
        newConnections.forEach((connection: Connection) => connection.wakeUp());
        return this;
    }

    public upload(params: UploadInput): Promise<UploadOutput> {
        return new Promise((resolve, reject) => {
            try {
                // FIX ME check if upload already in progress => if yes throw error
                if (this.context.getStatus() !== UploaderStatus.Pending) {
                    throw new UploaderError('Transfer already started');
                }
                this.transferPromise = { resolve, reject };
                if (!params.files.length) {
                    throw new UploaderError('You must add some files to create a Transfer');
                }
                this.context.createTransfer(params);
                this.emitStarting();
                this.startProgressTimer();
                this.startSpeedTimer();
                this.startQueueTimer();
                this.addConnections(this.initiaParallelConnections);
            } catch (error: unknown) {
                this.emitError(error);
            }
        });
    }

    public update(params: UpdateTransferInput): Promise<UpdateTransferOutput> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.context.isFinished()) {
                    throw new UploaderError('Transfer already finished');
                }
                const updatedTransfer = await this.context.updateTransfer(params);
                resolve(updatedTransfer);
            } catch (error: unknown) {
                reject(error);
            }
        });
    }

    public cancel(): void {
        if (this.context.isCanceled()) {
            return;
        }
        this.context.cancel();
        this.connections.reset();
        //FIX ME drop connections
        this.connections.forEach((connection: Connection) => {
            connection.reset();
            // connection.uploadProgress = () => null;// FIX ME REWORK
            // connection.promise.cancel();// FIX ME REWORK
            //We shall call a uniq function witch do the job
            //FIX ME reset event emitter?
        });
        this.resetTimers();
        this.emitCanceled();
    }
}
