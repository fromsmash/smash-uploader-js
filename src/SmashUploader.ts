import { Context } from './core/Context';
import { CustomEventEmitter } from './core/CustomEventEmitter';
import { TaskError } from './errors/TaskError';
import { UploaderError } from './errors/UploaderError';
import { CanceledEvent } from './events/CanceledEvent';
import { ChangesEvent } from './events/ChangesEvent';
import { ConnectionAvailableEvent } from './events/ConnectionAvailableEvent';
import { ConnectionBusyEvent } from './events/ConnectionBusyEvent';
import { FinishedEvent } from './events/FinishedEvent';
import { FinishingEvent } from './events/FinishingEvent';
import { QueuedEvent } from './events/QueuedEvent';
import { StartedEvent } from './events/StartedEvent';
import { StartingEvent } from './events/StartingEvent';
import { StatusEvent } from './events/StatusEvent';
import { UploadErrorEvent } from './events/UploadErrorEvent';
import { UploadProgressEvent, UploadProgressEventInput } from './events/UploadProgressEvent';
import { ConnectionEvents, UploaderStatus } from './globals/constant';
import { UploaderEvent } from './interface/Event';
import { UpdateInput, UploadInput } from './interface/Input';
import { UpdateOutput, UploadCanceledOutput, UploadCompleteOutput, UploadPausedOutput, UploadResumedOutput } from './interface/Output';
import { Preview } from './interface/Transfer';
import { UploaderParameters } from './interface/UploaderParameters';
import { Connection } from './modules/handlers/Connection';
import { Connections } from './modules/handlers/Connections';
import { Sequencer } from './modules/Sequencer';
import { Task } from './modules/tasks/Task';

export {
    CanceledEvent,
    ChangesEvent,
    FinishedEvent,
    FinishingEvent,
    QueuedEvent,
    StartedEvent,
    StartingEvent,
    StatusEvent,
    UploadErrorEvent,
    UploadProgressEvent
} from './events';

import {
    CustomUrlAlreadyInUseError,
    EmailNotAllowedError,
    EmptyFileListError,
    FileReaderAbortError,
    FileReaderNotFoundError,
    FileReaderNotReadableError,
    FileReaderSecurityError,
    FileReaderUnknownError,
    FileSystemAbortError,
    FileSystemNotFoundError,
    FileSystemPermissionDeniedError,
    FileSystemUnknownError,
    InvalidAvailabilityDurationError,
    InvalidDeliveryError,
    InvalidParameterError,
    InvalidSubscriptionError,
    MissingReceiversError,
    MissingSenderError,
    NetworkError,
    OwnerUsageExceededError,
    PasswordRequiredError,
    TransferAlreadyCanceledError,
    TransferAlreadyCancelingError,
    TransferAlreadyFinishedError,
    TransferAlreadyFinishingError,
    TransferAlreadyPausedError,
    TransferAlreadyQueuedError,
    TransferAlreadyStartedError,
    TransferAlreadyStartingError,
    TransferIsInErrorError,
    TransferNotFoundError,
    UnauthorizedError,
    UnknownError,
    UnsupportedFileSourceError,
    UnsupportedFileTypeError,
    UnvalidTokenError,
    UsageExceededError
} from './errors/errors';
import { PausedEvent } from './events/PausedEvent';
import { QueueFinished } from './events/QueueFinished';

export const errors = {
    EmptyFileListError,
    FileReaderAbortError,
    FileReaderNotReadableError,
    FileReaderSecurityError,
    FileReaderUnknownError,
    FileReaderNotFoundError,
    InvalidParameterError,
    CustomUrlAlreadyInUseError,
    UnauthorizedError,
    UnvalidTokenError,
    PasswordRequiredError,
    EmailNotAllowedError,
    FileSystemAbortError,
    FileSystemNotFoundError,
    FileSystemPermissionDeniedError,
    FileSystemUnknownError,
    InvalidAvailabilityDurationError,
    InvalidDeliveryError,
    InvalidSubscriptionError,
    MissingReceiversError,
    MissingSenderError,
    UnsupportedFileSourceError,
    UnsupportedFileTypeError,
    UsageExceededError,
    OwnerUsageExceededError,
    NetworkError,
    TransferAlreadyQueuedError,
    TransferAlreadyStartingError,
    TransferAlreadyCanceledError,
    TransferAlreadyCancelingError,
    TransferAlreadyFinishedError,
    TransferAlreadyFinishingError,
    TransferAlreadyPausedError,
    TransferAlreadyStartedError,
    TransferIsInErrorError,
    TransferNotFoundError,
    UnknownError,
    UploaderError,//TODO FIX ME good idea to put it here?
}

export { UploaderError } from './errors/UploaderError';

export { UploaderEvents, UploaderStatus } from './globals/constant';
export { UpdateInput, UploadInput } from './interface/Input';
export { UploaderParameters } from './interface/UploaderParameters';

export class SmashUploader extends CustomEventEmitter {
    private readonly initiaParallelConnections = 1;
    private connections: Connections;
    private sequencer: Sequencer;
    private context: Context;
    private uploadPromise!: { resolve: (value: UploadCompleteOutput | UploadCanceledOutput) => void, reject: (error: UploaderError) => void };
    private progressTimer?: NodeJS.Timeout;
    private speedTimer?: NodeJS.Timeout;
    private queueTimer?: NodeJS.Timeout;

    constructor(uploaderParameters: UploaderParameters) {
        super();
        this.context = new Context(uploaderParameters);
        this.connections = new Connections();
        this.sequencer = new Sequencer();
        this.bindConnections();
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
        this.context.reset();
        return this;
    }

    private emitChanges(event: UploaderEvent) {
        const changesEvent = new ChangesEvent({ event });
        this.emit(changesEvent.name, changesEvent);
    }

    private emitStatus() {
        const statusEvent = new StatusEvent(this.context);
        this.emit(statusEvent.name, statusEvent);
        this.emitChanges(statusEvent);
    }

    private emitStarting() {
        const context = this.context.starting();
        this.emitStatus();
        const startingEvent = new StartingEvent(context);
        this.emit(startingEvent.name, startingEvent);
        this.emitChanges(startingEvent);
    }

    private emitStarted() {
        const context = this.context.started();
        this.emitStatus();
        const startedEvent = new StartedEvent(context);
        this.emit(startedEvent.name, startedEvent);
        this.emitChanges(startedEvent);
    }

    private startQueueTimer() {
        this.queueTimer = setInterval(() => {
            if (this.context.localEndOfQueueTimestamp! < Date.now()) {
                this.emitQueueFinished();
                clearInterval(this.queueTimer);
            }
        }, 1000);
    }

    private emitQueue() {
        const context = this.context.queued();
        this.emitStatus();
        const queuedEvent = new QueuedEvent(context);
        this.emit(queuedEvent.name, queuedEvent);
        this.emitChanges(queuedEvent);
    }

    private emitQueueFinished() {
        const context = this.context.queueFinished();
        this.emitStatus();
        const queueFinishedEvent = new QueueFinished(context);
        this.emit(queueFinishedEvent.name, queueFinishedEvent);
        this.emitChanges(queueFinishedEvent);
    }

    private emitPaused() {
        const context = this.context.paused();
        this.emitStatus();
        const pausedEvent = new PausedEvent(context);
        this.emit(pausedEvent.name, pausedEvent);
        this.emitChanges(pausedEvent);
    }

    private emitProgress() {
        //TODO getProgressContext?

        const progressEvent = new UploadProgressEvent(this.context as UploadProgressEventInput);
        this.emit(progressEvent.name, progressEvent);
        this.emitChanges(progressEvent);
    }

    private emitFinishing() {
        this.emitProgress();
        const context = this.context.finishing();
        this.emitStatus();
        const finishingEvent = new FinishingEvent(context);
        this.emit(finishingEvent.name, finishingEvent);
        this.emitChanges(finishingEvent);
    }

    private emitFinished() {
        const context = this.context.finished();
        this.emitStatus();
        const finishedEvent = new FinishedEvent(context);
        this.emit(finishedEvent.name, finishedEvent);
        this.emitChanges(finishedEvent);
        this.resetTimers();
        this.uploadPromise.resolve({//TODO fix create function to generate this object
            status: this.context.getStatus(),
            transfer: {
                id: this.context.transfer!.id,
                status: this.context.transfer!.status,
                region: this.context.transfer!.region,
                transferUrl: this.context.transfer!.transferUrl,
                uploadState: this.context.transfer!.uploadState,
                availabilityEndDate: this.context.transfer!.availabilityEndDate,
                availabilityDuration: this.context.transfer!.availabilityDuration,
                availabilityStartDate: this.context.transfer!.availabilityStartDate,
                preview: this.context.transfer!.preview as Preview,
                created: this.context.transfer!.created,
                modified: this.context.transfer!.modified,
                size: this.context.transfer!.size,
                filesNumber: this.context.transfer!.filesNumber,
            }
        });
    }

    private emitCanceled() {
        const context = this.context.cancel();
        this.emitStatus();
        this.resetTimers();
        const canceledEvent = new CanceledEvent(context);
        this.emit(canceledEvent.name, canceledEvent);
        this.emitChanges(canceledEvent);
        this.uploadPromise.resolve({//TODO fix create function to generate this object
            status: this.context.getStatus(),
            transfer: this.context.transfer ? {
                id: this.context.transfer.id,
                status: this.context.transfer.status,
                region: this.context.transfer.region,
                transferUrl: this.context.transfer.transferUrl,
                uploadState: this.context.transfer.uploadState,
                availabilityEndDate: this.context.transfer.availabilityEndDate,
                availabilityDuration: this.context.transfer.availabilityDuration,
                availabilityStartDate: this.context.transfer.availabilityStartDate,
                preview: this.context.transfer.preview,
                created: this.context.transfer.created,
                modified: this.context.transfer.modified,
                size: this.context.transfer.size,
                filesNumber: this.context.transfer.filesNumber,
            } : undefined
        });
        this.reset();
    }

    private emitError(error: unknown) {
        this.context.error();
        this.emitStatus()
        if (error instanceof TaskError) {
            const errorEvent = new UploadErrorEvent({ error: error.getPublicError() });
            this.emit(errorEvent.name, errorEvent);
            this.emitChanges(errorEvent);
            this.uploadPromise.reject(error.getPublicError() as UploaderError);
        } else if (error instanceof Error) {
            this.uploadPromise.reject(new UploaderError(error));
        } else {
            this.uploadPromise.reject(new UploaderError('Unknown error'));
        }
        this.reset();
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
            if (this.context.isCanceled() || this.context.isOnError()) {
                return;
            }

            if (processedTask.isOnError()) {
                this.handleConnectionError(processedTask);
            } else {
                const nextTask = processedTask.postProcess(this.context);

                if (processedTask.isFirstTask()) {
                    this.addConnections(this.context.transfer!.parallelConnections);
                    if (this.context.hasQueue()) {
                        this.emitQueue();
                        this.startQueueTimer();
                    } else {
                        this.emitStarted();
                    }
                } else if (processedTask.isLastTask()) {
                    this.emitFinished();
                }

                if (nextTask) {
                    if (nextTask.isLastTask()) {
                        this.emitFinished();
                    } else {
                        this.startTask(connection, nextTask);
                    }
                } else {
                    if (this.context.isPaused()) {
                        return;
                    }
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

    public upload(params: UploadInput): Promise<UploadCompleteOutput | UploadCanceledOutput> {
        return new Promise((resolve, reject) => {
            try {
                this.uploadPromise = { resolve, reject };

                if (this.context.getStatus() === UploaderStatus.Queued) {
                    throw new TransferAlreadyQueuedError('Unable to upload, transfer is already in queue.');
                }

                if (this.context.getStatus() === UploaderStatus.QueueFinished) {
                    throw new TransferAlreadyQueuedError('Unable to upload, transfer is already in queue.');
                }

                if (this.context.getStatus() === UploaderStatus.Starting) {
                    throw new TransferAlreadyStartingError('Unable to upload, transfer is already starting.');
                }

                if (this.context.getStatus() === UploaderStatus.Started) {
                    throw new TransferAlreadyStartedError('Unable to upload, transfer is already started.');
                }

                if (this.context.getStatus() === UploaderStatus.Finishing) {
                    throw new TransferAlreadyFinishingError('Unable to upload, transfer is already finishing.');
                }

                if (this.context.getStatus() === UploaderStatus.Finished) {
                    throw new TransferAlreadyFinishedError('Unable to upload, transfer is already finished.');
                }

                if (this.context.getStatus() === UploaderStatus.Canceling) {
                    throw new TransferAlreadyCancelingError('Unable to upload, transfer is already canceling.');
                }

                if (this.context.getStatus() === UploaderStatus.Canceled) {
                    throw new TransferAlreadyCanceledError('Unable to upload, transfer is already canceled.');
                }

                if (this.context.getStatus() === UploaderStatus.Paused) {
                    throw new TransferAlreadyPausedError('Unable to upload, transfer is already paused.');
                }

                if (this.context.getStatus() === UploaderStatus.Error) {
                    throw new TransferIsInErrorError('Unable to upload, transfer is in error.');
                }

                if (!params.files.length) {
                    throw new EmptyFileListError('You must add some files to create a Transfer');
                }

                this.emitStarting();
                this.context.createTransfer(params);
                this.startProgressTimer();
                this.startSpeedTimer();
                this.addConnections(this.initiaParallelConnections);
            } catch (error: unknown) {
                this.emitError(error);
            }
        });
    }

    public resume(): Promise<UploadResumedOutput> {
        return new Promise(resolve => {
            try {
                if (this.context.isPaused() || this.context.isQueueFinished()) {
                    this.emitStarted();
                    this.pingConnections();
                }

                if (this.context.isQueued()) {
                    this.emitQueue();
                }
                resolve({
                    status: this.context.getStatus(),
                    transfer: {
                        id: this.context.transfer!.id!,
                        status: this.context.transfer!.status!,
                        region: this.context.transfer!.region!,
                        transferUrl: this.context.transfer!.transferUrl!,
                        uploadState: this.context.transfer!.uploadState!,
                        availabilityDuration: this.context.transfer!.availabilityDuration!,
                        preview: this.context.transfer!.preview as Preview,
                        created: this.context.transfer!.created!,
                        modified: this.context.transfer!.modified!,
                        size: this.context.transfer!.size,
                        filesNumber: this.context.transfer!.filesNumber,
                        queue: this.context.transfer!.queue,
                        queuedUntil: this.context.transfer!.queuedUntil,
                    }
                });
            } catch (error: unknown) {
                this.emitError(error);
            }
        });
    }

    public pause(): Promise<UploadPausedOutput> {
        return new Promise(resolve => {
            try {
                if (this.context.isStarted()) {
                    this.emitPaused();
                }
                resolve({
                    status: this.context.getStatus(),
                    transfer: {
                        id: this.context.transfer!.id!,
                        status: this.context.transfer!.status!,
                        region: this.context.transfer!.region!,
                        transferUrl: this.context.transfer!.transferUrl!,
                        uploadState: this.context.transfer!.uploadState!,
                        availabilityDuration: this.context.transfer!.availabilityDuration!,
                        preview: this.context.transfer!.preview as Preview,
                        created: this.context.transfer!.created!,
                        modified: this.context.transfer!.modified!,
                        size: this.context.transfer!.size,
                        filesNumber: this.context.transfer!.filesNumber,
                        queue: this.context.transfer!.queue,
                        queuedUntil: this.context.transfer!.queuedUntil,
                    }
                });
            } catch (error: unknown) {
                this.emitError(error);
            }
        });
    }

    public update(params: UpdateInput): Promise<UpdateOutput> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.context.getStatus() === UploaderStatus.Pending) {
                    throw new TransferAlreadyStartingError('Unable to update transfer, upload is pending.');
                }

                if (this.context.getStatus() === UploaderStatus.Starting) {
                    throw new TransferAlreadyStartingError('Unable to update transfer, upload is starting.');
                }

                if (this.context.getStatus() === UploaderStatus.Finishing) {
                    throw new TransferAlreadyFinishingError('Unable to update transfer, upload is finishing.');
                }

                if (this.context.getStatus() === UploaderStatus.Finished) {
                    throw new TransferAlreadyFinishedError('Unable to update transfer, upload is finished.');
                }

                if (this.context.getStatus() === UploaderStatus.Canceling) {
                    throw new TransferAlreadyCancelingError('Unable to update transfer, upload is canceling.');
                }

                if (this.context.getStatus() === UploaderStatus.Canceled) {
                    throw new TransferAlreadyCanceledError('Unable to update transfer, upload is canceled.');
                }

                if (this.context.getStatus() === UploaderStatus.Error) {
                    throw new TransferIsInErrorError('Unable to update transfer, upload is in error.');
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
            //  We shall call a uniq function witch do the job
            // FIX ME reset event emitter?
        });
        this.resetTimers();
        this.emitCanceled();
    }
}
