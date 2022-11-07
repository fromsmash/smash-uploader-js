import { CreateTransferFilePartsInput, CreateTransferFilePartsOutput } from '@smash-sdk/transfer/07-2020/types/CreateTransferFileParts/CreateTransferFileParts';
import { SDKError } from '@smash-sdk/core';
import { Context } from '../../core/Context';
import { FileItem } from '../../core/FileItem';
import { Parts } from '../../core/Parts';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
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
        this.context.transferSdk.errors.CreateTransferFilePartsError.Unauthorized,
        this.context.transferSdk.errors.CreateTransferFilePartsError.BadRequest,
        this.context.transferSdk.errors.CreateTransferFilePartsError.NotFound,
        this.context.transferSdk.errors.CreateTransferFilePartsError.TransferAlreadyLocked,
        this.context.transferSdk.errors.CreateTransferFilePartsError.FileAlreadyLocked,
        this.context.transferSdk.errors.CreateTransferFilePartsError.UnknownError,
    ];

    constructor(context: Context, file: FileItem, partsToCreate: Parts) {
        super(context);
        this.transfer = context.transfer!;
        this.file = file;
        this.partsToCreate = partsToCreate;
        this.createTransferFilePartsParameters = {
            transferId: context.transfer!.id,
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
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.Unauthorized ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.NotFound ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.BadRequest ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.TransferAlreadyLocked ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.FileAlreadyLocked ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.GatewayTimeout ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.BadGateway ||
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
                this.error.unrecoverableError();
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferFilePartsError.NetworkError) {
                this.error.setRecoveryTask(this.error.getTask());
            } else if (this.executionNumber < this.maxExecutionNumber) {
                this.error.setRecoveryTask(this.error.getTask());
            } else {
                this.error.unrecoverableError();
            }
            return this.error;
        }
        throw new Error('Method task.processError() should be called only if task.isOnError() === true');
    }
}
