import { GetTeamTransferOutput } from '@smash-sdk/transfer/10-2019/types/GetTeamTransfer/GetTeamTransfer';
import { GetTransferOutput } from '@smash-sdk/transfer/10-2019/types/GetTransfer/GetTransfer';
import { LockTransferInput, LockTransferOutput } from '@smash-sdk/transfer/10-2019/types/LockTransfer/LockTransfer';
import { SDKError } from 'smash-sdk-core/dist';
import { Context } from '../../core/Context';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { AbstractTask } from './AbstractTask';
import { Task } from './Task';

export class LockTransfer extends AbstractTask<Task> {
    private transfer: Transfer;
    private lockTransferParameters!: LockTransferInput;
    private response!: LockTransferOutput | GetTransferOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.LockTransferError.NotFound,
        this.context.transferSdk.errors.LockTransferError.Unauthorized,
        this.context.transferSdk.errors.LockTransferError.BadRequest,
        this.context.transferSdk.errors.LockTransferError.TransferAlreadyLocked,
        this.context.transferSdk.errors.LockTransferError.TransferIsDirty,
        this.context.transferSdk.errors.LockTransferError.UnknownError,
    ];

    constructor(context: Context) {
        super(context);
        this.transfer = context.transfer!;
        this.lockTransferParameters = {
            transferId: this.transfer.id,
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
                if (error instanceof this.context.transferSdk.errors.LockTransferError.TransferAlreadyLocked) {
                    if (this.transfer.team) {
                        const transfer = await this.context.transferSdk.getTeamTransfer({ transferId: this.transfer.id, teamId: this.transfer.team });
                        resolve(transfer);
                    } else {
                        const transfer = await this.context.transferSdk.getTransfer({ id: this.transfer.id });
                        resolve(transfer);
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
                    error instanceof this.context.transferSdk.errors.LockTransferError.TransferAlreadyLocked ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.NotFound ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.TransferAlreadyLocked ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.TransferIsDirty ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.Unauthorized ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.BadRequest ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.BadGateway ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.GatewayTimeout ||
                    error instanceof this.context.transferSdk.errors.LockTransferError.NetworkError
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
                this.error.unrecoverableError();
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.LockTransferError.NetworkError) {
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
