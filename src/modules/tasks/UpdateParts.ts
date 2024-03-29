import { UpdateTransferFilePartsInput, UpdateTransferFilePartsOutput } from '@smash-sdk/transfer/01-2024';
import { SDKError } from '@smash-sdk/core';
import { Context } from '../../core/Context';
import { FileItem } from '../../core/FileItem';
import { Parts } from '../../core/Parts';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { AbstractTask } from './AbstractTask';
import { Task } from './Task';
import { UpdateFile } from './UpdateFile';
import { UploaderError } from '../../errors/UploaderError';

export class UpdateParts extends AbstractTask<Task> {
    private transfer: Transfer;
    private file: FileItem;
    private parts: Parts;
    private updateTransferFilePartsParameters!: UpdateTransferFilePartsInput;
    private response!: UpdateTransferFilePartsOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.UpdateTransferFilePartsError.InvalidParameterError,
        this.context.transferSdk.errors.UpdateTransferFilePartsError.FileAlreadyLockedError,
        this.context.transferSdk.errors.UpdateTransferFilePartsError.NotFoundError,
        this.context.transferSdk.errors.UpdateTransferFilePartsError.TransferAlreadyLockedError,
        this.context.transferSdk.errors.UpdateTransferFilePartsError.UnauthorizedError,
        this.context.transferSdk.errors.UpdateTransferFilePartsError.UnknownError,
    ];

    constructor(context: Context, file: FileItem, parts: Parts) {
        super(context);
        this.transfer = context.transfer!;
        this.file = file;
        this.parts = parts;
        this.updateTransferFilePartsParameters = {
            transferId: this.transfer.id!,
            fileId: this.file.id,
            parts: this.parts.map(part => ({ etag: part.etag!, crc32: part.crc32!, id: part.id })),
        };
    }

    public preProcess(context: Context): Task | null {
        return this;
    }

    public process(): Promise<UpdateParts> {
        return new Promise(async resolve => {
            try {
                this.response = await this.context.transferSdk.updateTransferFileParts(this.updateTransferFilePartsParameters);
            } catch (error: unknown) {
                if (
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.FileAlreadyLockedError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.TransferAlreadyLockedError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.NetworkError
                ) {
                    this.error = new TaskError(this, error);
                } else {
                    this.error = new TaskError(this, error);
                }
            }
            resolve(this);
        });
    }

    public postProcess(context: Context): Task | null {
        this.transfer.populateCompletedParts(this.file, this.parts, this.response);
        if (this.file.hasAllPartsUploaded()) {
            context.updateFileQueue.add(new UpdateFile(this.context, this.file));
        }
        return null;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError(new UploaderError(this.error.getError() as SDKError));
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.UpdateTransferFilePartsError.NetworkError) {
                this.error.setRecoveryTask(this.error.getTask());
            } else if (this.executionNumber < this.maxExecutionNumber) {
                this.error.setRecoveryTask(this.error.getTask());
            } else {
                this.error.unrecoverableError(new UploaderError(this.error.getError() as Error));
            }
            return this.error;
        }
        throw new Error('Method task.processError() should be called only if task.isOnError() === true');
    }
}

