import { Context } from './core/Context';
import { CustomEventEmitter } from './core/CustomEventEmitter';
import { TaskError } from './errors/TaskError';
import { UploaderError } from './errors/UploaderError';
import { CanceledEvent, CanceledEventInput } from './events/CanceledEvent';
import { ChangesEvent } from './events/ChangesEvent';
import { ConnectionAvailableEvent } from './events/ConnectionAvailableEvent';
import { ConnectionBusyEvent } from './events/ConnectionBusyEvent';
import { FinishedEvent, FinishedEventInput } from './events/FinishedEvent';
import { FinishingEvent, FinishingEventInput } from './events/FinishingEvent';
import { QueuedEvent, QueuedEventInput } from './events/QueuedEvent';
import { StartedEvent, StartedEventInput } from './events/StartedEvent';
import { StartingEvent, StartingEventInput } from './events/StartingEvent';
import { StatusEvent, StatusEventInput } from './events/StatusEvent';
import { UploadErrorEvent } from './events/UploadErrorEvent';
import { UploadProgressEvent, UploadProgressEventInput } from './events/UploadProgressEvent';
import { ConnectionEvents, UploaderStatus } from './globals/constant';
import { UploaderEvent } from './interface/Event';
import { UpdateInput, UploadInput } from './interface/Input';
import { UpdateOutput, UploadCanceledOutput, UploadCompleteOutput } from './interface/Output';
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
    EmptyFileListError,
    FileReaderAbortError,
    FileReaderNotReadableError,
    FileReaderSecurityError,
    FileReaderUnknownError,
    FileReaderNotFoundError,
    InvalidParameterError,
    CustomUrlAlreadyInUseError,
    TransferAlreadyFinishedError,
    TransferAlreadyStartedError,
    TransferIsInQueueError,
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
    NetworkError,
} from './errors/errors';

export const errors = {
    EmptyFileListError,
    FileReaderAbortError,
    FileReaderNotReadableError,
    FileReaderSecurityError,
    FileReaderUnknownError,
    FileReaderNotFoundError,
    InvalidParameterError,
    CustomUrlAlreadyInUseError,
    TransferAlreadyFinishedError,
    TransferAlreadyStartedError,
    TransferIsInQueueError,
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
    NetworkError,
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
    private transferPromise!: { resolve: (value: UploadCompleteOutput | UploadCanceledOutput) => void, reject: (error: UploaderError) => void };
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

    private emitChanges(event: UploaderEvent) {
        const changesEvent = new ChangesEvent({ event });
        this.emit(changesEvent.name, changesEvent);
    }

    private emitStatus() {
        const statusEvent = new StatusEvent(this.context as StatusEventInput);
        this.emit(statusEvent.name, statusEvent);
        this.emitChanges(statusEvent);
    }

    private emitStarting() {
        this.context.starting();
        this.emitStatus();
        const startingEvent = new StartingEvent(this.context as StartingEventInput);
        this.emitChanges(startingEvent);
    }

    private emitStarted() {
        this.context.started();
        this.emitStatus();
        const startedEvent = new StartedEvent(this.context as StartedEventInput);
        this.emit(startedEvent.name, startedEvent);
        this.emitChanges(startedEvent);
    }

    private emitQueue() {
        this.context.queued();
        this.emitStatus();
        const queuedEvent = new QueuedEvent(this.context as QueuedEventInput);
        this.emit(queuedEvent.name, queuedEvent);
        this.emitChanges(queuedEvent);
    }

    private emitProgress() {
        const progressEvent = new UploadProgressEvent(this.context as UploadProgressEventInput);
        this.emit(progressEvent.name, progressEvent);
        this.emitChanges(progressEvent);
    }

    private emitFinished() {
        this.context.finished();
        this.resetTimers();
        this.emitStatus();
        const finishedEvent = new FinishedEvent(this.context as FinishedEventInput);
        this.emit(finishedEvent.name, finishedEvent);
        this.emitChanges(finishedEvent);
        this.transferPromise.resolve({
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

    private emitFinishing() {
        this.context.finishing();
        this.emitStatus();
        const finishingEvent = new FinishingEvent(this.context as FinishingEventInput);
        this.emit(finishingEvent.name, finishingEvent);
        this.emitChanges(finishingEvent);
    }

    private emitError(error: unknown) {
        this.context.error();
        this.emitStatus()
        if (error instanceof TaskError) {
            const errorEvent = new UploadErrorEvent({ error: error.getPublicError() });
            this.emit(errorEvent.name, errorEvent);
            this.emitChanges(errorEvent);
            this.transferPromise.reject(error.getPublicError() as UploaderError);
        } else if (error instanceof Error) {
            this.transferPromise.reject(new UploaderError(error));
        } else {
            this.transferPromise.reject(new UploaderError('Unknown error'));
        }
        this.reset();
    }

    private emitCanceled() {
        this.context.cancel();
        this.emitStatus();
        this.resetTimers();
        const canceledEvent = new CanceledEvent(this.context as CanceledEventInput);
        this.emit(canceledEvent.name, canceledEvent);
        this.emitChanges(canceledEvent);
        this.transferPromise.resolve({
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

    private emitQueueIfNeeded() {
        if (this.context?.transfer?.queuedUntil && new Date(this.context.transfer.queuedUntil).getTime() > new Date().getTime()) {
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

    public upload(params: UploadInput): Promise<UploadCompleteOutput | UploadCanceledOutput> {
        return new Promise((resolve, reject) => {
            try {
                // FIX ME check if upload already in progress => if yes throw error
                if (this.context.getStatus() !== UploaderStatus.Pending) {
                    throw new TransferAlreadyStartedError('Transfer already started');
                }
                this.transferPromise = { resolve, reject };
                if (!params.files.length) {
                    throw new EmptyFileListError('You must add some files to create a Transfer');
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

    public update(params: UpdateInput): Promise<UpdateOutput> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.context.isFinished()) {
                    throw new TransferAlreadyFinishedError('Transfer already finished');
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
