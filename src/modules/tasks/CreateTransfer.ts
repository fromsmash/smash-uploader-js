import { CreateTeamTransferInput, CreateTeamTransferOutput } from '@smash-sdk/transfer/10-2019/types/CreateTeamTransfer/CreateTeamTransfer';
import { CreateTransferInput, CreateTransferOutput } from '@smash-sdk/transfer/10-2019/types/CreateTransfer/CreateTransfer';
import { SDKError } from '@smash-sdk/core';
import { Context } from '../../core/Context';
import { CustomizationInput, Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { AbstractTask } from './AbstractTask';
import { CreateFile } from './CreateFile';
import { Task } from './Task';

export class CreateTransfer extends AbstractTask<Task> {
    private transfer: Transfer;
    private createTransferParameters: CreateTransferInput | null = null;
    private createTeamTransferParameters: CreateTeamTransferInput | null = null;
    private response!: CreateTransferOutput | CreateTeamTransferOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.CreateTransferError.Unauthorized,
        this.context.transferSdk.errors.CreateTeamTransferError.Unauthorized,
        this.context.transferSdk.errors.CreateTransferError.BadRequest,
        this.context.transferSdk.errors.CreateTeamTransferError.BadRequest,
        this.context.transferSdk.errors.CreateTransferError.Forbidden,
        this.context.transferSdk.errors.CreateTeamTransferError.Forbidden,
        this.context.transferSdk.errors.CreateTransferError.CustomUrlAlreadyInUse,
        this.context.transferSdk.errors.CreateTeamTransferError.CustomUrlAlreadyInUse,
        this.context.transferSdk.errors.CreateTransferError.UnknownError,
        this.context.transferSdk.errors.CreateTeamTransferError.UnknownError,
    ];

    constructor(context: Context) {
        super(context);
        this.transfer = context.transfer!;
        if (context?.transfer?.teamId) {
            this.createTeamTransferParameters = {
                size: context.transfer.size,
                customUrl: context.transfer.customUrl,
                language: context.transfer.language,
                availabilityDuration: context.transfer.availabilityDuration,
                title: context.transfer.title,
                delivery: context.transfer.delivery,
                customization: context.transfer.customization as CustomizationInput,
                promotion: context.transfer.promotion,
                preview: context.transfer.preview,
                accessTracking: context.transfer.accessTracking,
                password: context.transfer.password,
                notificationType: context.transfer.notificationType,
                description: context.transfer.description,
                filesNumber: context.transfer.filesNumber,
                teamId: context.transfer.teamId,
                domain: context.transfer.domain,
            };
        } else {
            this.createTransferParameters = {
                size: context.transfer!.size,
                customUrl: context.transfer!.customUrl,
                language: context.transfer!.language,
                availabilityDuration: context.transfer!.availabilityDuration,
                title: context.transfer!.title,
                delivery: context.transfer!.delivery,
                customization: context.transfer!.customization as CustomizationInput,
                promotion: context.transfer!.promotion,
                preview: context.transfer!.preview,
                accessTracking: context.transfer!.accessTracking,
                password: context.transfer!.password,
                notificationType: context.transfer!.notificationType,
                description: context.transfer!.description,
                filesNumber: context.transfer!.filesNumber,
                domain: context.transfer!.domain,
            };
        }
    }

    public isFirstTask(): boolean {
        return true;
    }

    public preProcess(context: Context): Task | null {
        return this;
    }

    public process(): Promise<CreateTransfer> {
        return new Promise(async resolve => {
            try {
                if (this.createTeamTransferParameters) {
                    this.response = await this.context.transferSdk.createTeamTransfer(this.createTeamTransferParameters);
                } else if (this.createTransferParameters) {
                    this.response = await this.context.transferSdk.createTransfer(this.createTransferParameters);
                }
            } catch (error) {
                if (error instanceof this.context.transferSdk.errors.CreateTeamTransferError.Unauthorized ||
                    error instanceof this.context.transferSdk.errors.CreateTeamTransferError.Forbidden ||
                    error instanceof this.context.transferSdk.errors.CreateTeamTransferError.BadRequest ||
                    error instanceof this.context.transferSdk.errors.CreateTeamTransferError.CustomUrlAlreadyInUse ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.Unauthorized ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.Forbidden ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.BadRequest ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.CustomUrlAlreadyInUse ||
                    error instanceof this.context.transferSdk.errors.CreateTeamTransferError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.CreateTeamTransferError.GatewayTimeout ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.GatewayTimeout ||
                    error instanceof this.context.transferSdk.errors.CreateTeamTransferError.BadGateway ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.BadGateway ||
                    error instanceof this.context.transferSdk.errors.CreateTeamTransferError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.CreateTransferError.NetworkError
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
        this.transfer.populateCreatedTransfer(this.response);
        this.transfer.files.forEach(file => {
            context.createFileQueue.add(new CreateFile(context, file));
        });
        return null;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError();
            } else if (
                this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.NetworkError ||
                this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.NetworkError
            ) {
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
