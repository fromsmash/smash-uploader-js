import { GetTeamTransferOutput, GetTransferOutput, LockTransferInput, LockTransferOutput } from '@smash-sdk/transfer/10-2019';
import { SDKError } from '@smash-sdk/core/dist';
import { Context } from '../../core/Context';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { AbstractTask } from './AbstractTask';
import { Task } from './Task';
import { UploaderError } from '../../errors/UploaderError';

export class LockTransfer extends AbstractTask<Task> {
    private transfer: Transfer;
    private lockTransferParameters!: LockTransferInput;
    private response!: LockTransferOutput | GetTeamTransferOutput | GetTransferOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.LockTransferError.NotFoundError,
        this.context.transferSdk.errors.LockTransferError.UnauthorizedError,
        this.context.transferSdk.errors.LockTransferError.InvalidParameterError,
        this.context.transferSdk.errors.LockTransferError.TransferAlreadyLockedError,
        this.context.transferSdk.errors.LockTransferError.TransferIsDirtyError,
        this.context.transferSdk.errors.LockTransferError.UnknownError,
        this.context.transferSdk.errors.GetTeamTransferError.NotFoundError,
        this.context.transferSdk.errors.GetTeamTransferError.UnauthorizedError,
        this.context.transferSdk.errors.GetTeamTransferError.InvalidParameterError,
        this.context.transferSdk.errors.GetTeamTransferError.UnknownError,
        this.context.transferSdk.errors.GetTransferError.NotFoundError,
        this.context.transferSdk.errors.GetTransferError.UnauthorizedError,
        this.context.transferSdk.errors.GetTransferError.InvalidParameterError,
        this.context.transferSdk.errors.GetTransferError.UnknownError,
    ];

    constructor(context: Context) {
        super(context);
        this.transfer = context.transfer!;
        this.lockTransferParameters = {
            transferId: this.transfer.id!,
        };
    }

    public isLastTask(): boolean {
        return true;
    }

    public preProcess(context: Context): Task | null {
        return this;
    }

    private lockTransfer(): Promise<LockTransferOutput | GetTransferOutput | GetTeamTransferOutput> {
        return new Promise(async (resolve, reject) => {
            try {
                const transfer = await this.context.transferSdk.lockTransfer(this.lockTransferParameters);
                resolve(transfer);
            } catch (error: unknown) {
                if (error instanceof this.context.transferSdk.errors.LockTransferError.TransferAlreadyLockedError) {
                    try {
                        if (this.transfer.teamId) {
                            const transfer = await this.context.transferSdk.getTeamTransfer({ transferId: this.transfer.id!, teamId: this.transfer.teamId });
                            resolve(transfer);
                        } else {
                            const transfer = await this.context.transferSdk.getTransfer({ transferId: this.transfer.id! });
                            resolve(transfer);
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

    public process(): Promise<LockTransfer> {
        return new Promise(async resolve => {
            try {
                this.response = await this.lockTransfer();
            } catch (error: unknown) {
                if (
                    error instanceof this.context.transferSdk.errors.LockTransferError.TransferAlreadyLockedError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.TransferIsDirtyError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.NetworkError || 
                    error instanceof this.context.transferSdk.errors.GetTeamTransferError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.GetTeamTransferError.NetworkError ||
                    error instanceof this.context.transferSdk.errors.GetTransferError.InvalidParameterError ||
                    error instanceof this.context.transferSdk.errors.GetTransferError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.GetTransferError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.GetTransferError.NotFoundError ||
                    error instanceof this.context.transferSdk.errors.GetTransferError.UnauthorizedError ||
                    error instanceof this.context.transferSdk.errors.GetTransferError.BadGatewayError ||
                    error instanceof this.context.transferSdk.errors.GetTransferError.GatewayTimeoutError ||
                    error instanceof this.context.transferSdk.errors.GetTransferError.NetworkError
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
        this.transfer.populateLockedTransfer(this.response);
        return null;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError(new UploaderError(this.error.getError() as SDKError));
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.LockTransferError.NetworkError) {
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
