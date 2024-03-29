import { SDKError } from '@smash-sdk/core';
import { CreateTransferFilePartsInput, CreateTransferFilePartsOutput } from '@smash-sdk/transfer/07-2020';
import { Context } from '../../core/Context';
import { FileItem } from '../../core/FileItem';
import { Parts } from '../../core/Parts';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { UploaderError } from '../../errors/UploaderError';
import { AbstractTask } from './AbstractTask';
import { Task } from './Task';
import { UploadPart } from './UploadPart';

export class CreateParts extends AbstractTask<Task> {
    private transfer: Transfer;
    private file: FileItem;
    private partsToCreate: Parts;
    private createTransferFilePartsParameters!: CreateTransferFilePartsInput;
    private response!: CreateTransferFilePartsOutput;
    protected readonly sdkFatalErrors: (typeof SDKError)[] = [
        this.context.transferSdk.errors.CreateTransferFilePartsError.UnauthorizedError,
        this.context.transferSdk.errors.CreateTransferFilePartsError.InvalidParameterError,
        this.context.transferSdk.errors.CreateTransferFilePartsError.NotFoundError,
        this.context.transferSdk.errors.CreateTransferFilePartsError.TransferAlreadyLockedError,
        this.context.transferSdk.errors.CreateTransferFilePartsError.FileAlreadyLockedError,
        this.context.transferSdk.errors.CreateTransferFilePartsError.UnknownError,
    ];

    constructor(context: Context, file: FileItem, partsToCreate: Parts) {
        super(context);
        this.transfer = context.transfer!;
        this.file = file;
        this.partsToCreate = partsToCreate;
        this.createTransferFilePartsParameters = {
            transferId: context.transfer!.id!,
            fileId: file.id,
            parts: partsToCreate.map<{ id: number }>(part => ({ id: part.id })),
        };
    }

    public preProcess(context: Context): Task | null {
        return this;
    }

    public process(): Promise<CreateParts> {
        return new Promise(async resolve => {
            try {
                this.response = await this.context.transferSdk.createTransferFileParts(this.createTransferFilePartsParameters);
            } catch (error) {
                if (
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.TransferAlreadyLockedError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.FileAlreadyLockedError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.NetworkError
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
        const parts = this.transfer.populateCreatedParts(this.file, this.partsToCreate, this.response);
        parts.forEach(part => {
            context.uploadPartQueue.add(new UploadPart(context, this.file, part));
        });

        return null;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError(new UploaderError(this.error.getError() as SDKError));
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.NetworkError) {
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
