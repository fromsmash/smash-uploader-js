import { UpdateTransferFileInput, UpdateTransferFileOutput, GetTeamTransferFileOutput, GetTransferFileOutput } from '@smash-sdk/transfer/01-2024';
import { SDKError } from '@smash-sdk/core/dist';
import { Context } from '../../core/Context';
import { FileItem } from '../../core/FileItem';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { AbstractTask } from './AbstractTask';
import { CreateParts } from './CreateParts';
import { LockTransfer } from './LockTransfer';
import { Task } from './Task';
import { UploaderError } from '../../errors/UploaderError';

export class UpdateFile extends AbstractTask<Task> {
    private transfer: Transfer;
    private file: FileItem;
    private updateTransferFileParameters: UpdateTransferFileInput;
    private response!: UpdateTransferFileOutput | GetTeamTransferFileOutput | GetTransferFileOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.UpdateTransferFileError.InvalidParameterError,
        this.context.transferSdk.errors.UpdateTransferFileError.NotFoundError,
        this.context.transferSdk.errors.UpdateTransferFileError.TransferAlreadyLockedError,
        this.context.transferSdk.errors.UpdateTransferFileError.UnauthorizedError,
        this.context.transferSdk.errors.UpdateTransferFileError.UnknownError,
        this.context.transferSdk.errors.GetTeamTransferFileError.NotFoundError,
        this.context.transferSdk.errors.GetTeamTransferFileError.UnauthorizedError,
        this.context.transferSdk.errors.GetTeamTransferFileError.UnknownError,
        this.context.transferSdk.errors.GetTeamTransferFileError.InvalidParameterError,
        this.context.transferSdk.errors.GetTransferFileError.NotFoundError,
        this.context.transferSdk.errors.GetTransferFileError.UnauthorizedError,
        this.context.transferSdk.errors.GetTransferFileError.UnknownError,
        this.context.transferSdk.errors.GetTransferFileError.InvalidParameterError,
    ];

    constructor(context: Context, file: FileItem) {
        super(context);
        this.transfer = context.transfer!;
        this.file = file;
        this.updateTransferFileParameters = {
            transferId: this.transfer.id!,
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

    private updateFile(): Promise<UpdateTransferFileOutput | GetTeamTransferFileOutput | GetTransferFileOutput> {
        return new Promise(async (resolve, reject) => {
            try {
                const file = await this.context.transferSdk.updateTransferFile(this.updateTransferFileParameters);
                resolve(file);
            } catch (error: unknown) {
                if (error instanceof this.context.transferSdk.errors.UpdateTransferFileError.FileAlreadyLockedError) {
                    try {
                        if (this.transfer.teamId) {
                            const file = await this.context.transferSdk.getTeamTransferFile({ transferId: this.transfer.id!, teamId: this.transfer.teamId, fileId: this.file.id! });
                            resolve(file);
                        } else {
                            const file = await this.context.transferSdk.getTransferFile({ transferId: this.transfer.id!, fileId: this.file.id! });
                            resolve(file);
                        }
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(error);
                }
            }
        })
    }

    public process(): Promise<UpdateFile> {
        return new Promise(async resolve => {
            try {
                this.response = await this.updateFile();
            } catch (error: unknown) {
                if (
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.TransferAlreadyLockedError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.UpdateTransferFileError.NetworkError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferFileError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferFileError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferFileError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferFileError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferFileError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferFileError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferFileError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferFileError.NetworkError ||
                    error instanceof this.context.transferSdk.errors.GetTransferFileError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.GetTransferFileError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.GetTransferFileError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.GetTransferFileError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.GetTransferFileError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.GetTransferFileError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.GetTransferFileError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.GetTransferFileError.NetworkError
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
                this.error.unrecoverableError(new UploaderError(this.error.getError() as SDKError));
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.UpdateTransferFileError.NetworkError) {
                this.error.setRecoveryTask(this.error.getTask());
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.UpdateTransferFileError.InternalServerError) {
                this.retryFileParts();
            } else if (this.executionNumber < this.maxExecutionNumber) {
                this.error.setRecoveryTask(this.error.getTask());
            } else {
                this.error.unrecoverableError(new UploaderError(this.error.getError() as Error));
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
