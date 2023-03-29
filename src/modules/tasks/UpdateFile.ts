import { UpdateTransferFileInput, UpdateTransferFileOutput } from '@smash-sdk/transfer/10-2019/types/UpdateTransferFile/UpdateTransferFile';
import { SDKError } from '@smash-sdk/core/dist';
import { Context } from '../../core/Context';
import { FileItem } from '../../core/FileItem';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { AbstractTask } from './AbstractTask';
import { CreateParts } from './CreateParts';
import { LockTransfer } from './LockTransfer';
import { Task } from './Task';

export class UpdateFile extends AbstractTask<Task> {
    private transfer: Transfer;
    private file: FileItem;
    private updateTransferFileParameters: UpdateTransferFileInput;
    private response!: UpdateTransferFileOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.UpdateTransferError.InvalidParameterError,
        this.context.transferSdk.errors.UpdateTransferError.NotFoundError,
        this.context.transferSdk.errors.UpdateTransferError.TransferAlreadyLockedError,
        this.context.transferSdk.errors.UpdateTransferError.UnauthorizedError,
        this.context.transferSdk.errors.UpdateTransferError.UnknownError,
    ];

    constructor(context: Context, file: FileItem) {
        super(context);
        this.transfer = context.transfer!;
        this.file = file;
        this.updateTransferFileParameters = {
            transferId: this.transfer.id,
            fileId: this.file.id,
        };
        if (this.file.hasInlinePartsToValidate()) {
            const parts = this.file.getInlinePartsToValidate();
            this.updateTransferFileParameters.parts = parts.map<{ etag: string; crc32: number; id: number; }>(part => ({ id: part.id, etag: part.etag!, crc32: part.crc32! }));
        }
    }

    public preProcess(context: Context): Task | null {
        return this;
    }

    public process(): Promise<UpdateFile> {
        return new Promise(async resolve => {
            try {
                this.response = await this.context.transferSdk.updateTransferFile(this.updateTransferFileParameters);
            } catch (error: unknown) {
                if (
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.TransferAlreadyLockedError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferError.NetworkError
                ) {
                    this.error = new TaskError(this, error);
                } else {
                    this.error = new TaskError(this, error);
                }
            }
            resolve(this);
        });
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError();
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.UpdateTransferError.NetworkError) {
                this.error.setRecoveryTask(this.error.getTask());
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.UpdateTransferError.InternalServerError) {
                this.retryFileParts();
            } else if (this.executionNumber < this.maxExecutionNumber) {
                this.error.setRecoveryTask(this.error.getTask());
            } else {
                this.error.unrecoverableError();
            }
            return this.error;
        }
        throw new Error('Method task.processError() should be called only if task.isOnError() === true');
    }

    public postProcess(context: Context): Task | null {
        this.transfer.populateCompletedFile(this.file, this.response);
        if (this.transfer.hasAllFilesUploaded()) {
            context.lockTransferQueue.add(new LockTransfer(this.context));
        }
        return null;
    }

    private retryFileParts() {
        this.file.resetParts();
        this.context.createPartsQueue.add(new CreateParts(this.context, this.file, this.file.partsToCreate));
    }
}
