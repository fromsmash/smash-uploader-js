import { CreateTransferFileInput, CreateTransferFileOutput } from '@smash-sdk/transfer/07-2020/types/CreateTransferFile/CreateTransferFile';
import { GetTeamTransferFileOutput } from '@smash-sdk/transfer/10-2019/types/GetTeamTransferFile/GetTeamTransferFile';
import { GetTransferFileOutput } from '@smash-sdk/transfer/10-2019/types/GetTransferFile/GetTransferFile';
import { SDKError } from '@smash-sdk/core';
import { Context } from '../../core/Context';
import { FileItem } from '../../core/FileItem';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { AbstractTask } from './AbstractTask';
import { CreateParts } from './CreateParts';
import { Task } from './Task';
import { UploadPart } from './UploadPart';

export class CreateFile extends AbstractTask<Task> {
    private transfer: Transfer;
    private file: FileItem;
    private createTransferFileParameters: CreateTransferFileInput;
    private response!: CreateTransferFileOutput | GetTransferFileOutput | GetTeamTransferFileOutput;
    protected readonly sdkFatalErrors: (typeof SDKError)[] = [
        this.context.transferSdk.errors.CreateTransferFileError.Unauthorized,
        this.context.transferSdk.errors.CreateTransferFileError.BadRequest,
        this.context.transferSdk.errors.CreateTransferFileError.NotFound,
        this.context.transferSdk.errors.CreateTransferFileError.TransferAlreadyLocked,
        this.context.transferSdk.errors.CreateTransferFileError.TransferIsInQueue,
        this.context.transferSdk.errors.CreateTransferFileError.UnknownError,
    ];

    constructor(context: Context, file: FileItem) {
        super(context);
        this.transfer = context.transfer!;
        this.file = file;
        this.createTransferFileParameters = {
            transferId: this.transfer.id,
            size: this.file.size,
            name: this.file.name,
        };
    }

    public preProcess(context: Context): Task | null {
        return this;
    }

    private createTransferFile(): Promise<CreateTransferFileOutput | GetTransferFileOutput | GetTeamTransferFileOutput> {
        return new Promise(async (resolve, reject) => {
            try {
                const file = await this.context.transferSdk.createTransferFile(this.createTransferFileParameters);
                resolve(file);
            } catch (error: unknown) {
                if (error instanceof this.context.transferSdk.errors.CreateTransferFileError.Conflict) {
                    if (this.transfer.teamId) {
                        const file = await this.context.transferSdk.getTeamTransferFile({ transferId: this.transfer.id, fileId: this.file.id, teamId: this.transfer.teamId });
                        resolve(file);
                    } else {
                        const file = await this.context.transferSdk.getTransferFile({ transferId: this.transfer.id, fileId: this.file.id });
                        resolve(file);
                    }
                } else {
                    reject(error);
                }
            }
        })
    }

    public process(): Promise<CreateFile> {
        return new Promise(async resolve => {
            try {
                this.response = await this.createTransferFile();
            } catch (error) {
                // TODO CORS Error (only browser)
                if (error instanceof this.context.transferSdk.errors.CreateTransferFileError.Unauthorized ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.TransferAlreadyLocked ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.BadRequest ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.NotFound ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.TransferIsInQueue ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.BadGateway ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.GatewayTimeout ||
                    error instanceof this.context.transferSdk.errors.CreateTransferFileError.NetworkError
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
        this.transfer.populateCreatedFile(this.file, this.response);
        this.file.partsToUpload.forEach(part => {
            context.uploadPartQueue.add(new UploadPart(this.context, this.file, part));
        });
        // FIX ME Don't know where to put it...
        const partsToCreate = [];
        for (let i = 0; i < this.file.partsToCreate.length; i += this.file.maxInlineParts) {
            const chunk = this.file.partsToCreate.slice(i, i + this.file.maxInlineParts);
            partsToCreate.push(chunk);
        }
        // END FIX ME
        partsToCreate.forEach(parts => {
            context.createPartsQueue.add(new CreateParts(this.context, this.file, parts));
        });
        return null;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError();
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferFileError.NetworkError) {
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
