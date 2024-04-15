import { SDKError } from '@smash-sdk/core';
import { CreateDropboxTransferInput, CreateDropboxTransferOutput, CreateTeamTransferInput, CreateTeamTransferOutput, CreateTransferInput, CreateTransferOutput } from '@smash-sdk/transfer/01-2024';
import { Context } from '../../core/Context';
import { CustomizationInput, Transfer } from '../../core/Transfer';
import { CustomUrlAlreadyInUseError, EmailNotAllowedError, InvalidAvailabilityDurationError, InvalidParameterError, InvalidSubscriptionError, OwnerUsageExceededError, PasswordRequiredError, UnauthorizedError, UsageExceededError } from '../../errors/errors';
import { TaskError } from '../../errors/TaskError';
import { UploaderError } from '../../errors/UploaderError';
import { AbstractTask } from './AbstractTask';
import { CreateFile } from './CreateFile';
import { Task } from './Task';

export class CreateTransfer extends AbstractTask<Task> {
    private transfer: Transfer;
    private createTransferParameters: CreateTransferInput | null = null;
    private createTeamTransferParameters: CreateTeamTransferInput | null = null;
    private createDropboxTransferParameters: CreateDropboxTransferInput | null = null;
    private response!: CreateTransferOutput | CreateTeamTransferOutput | CreateDropboxTransferOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.CreateTransferError.UnauthorizedError,
        this.context.transferSdk.errors.CreateTeamTransferError.UnauthorizedError,
        this.context.transferSdk.errors.CreateDropboxTransferError.UnauthorizedError,
        this.context.transferSdk.errors.CreateTransferError.InvalidParameterError,
        this.context.transferSdk.errors.CreateTeamTransferError.InvalidParameterError,
        this.context.transferSdk.errors.CreateDropboxTransferError.InvalidParameterError,
        this.context.transferSdk.errors.CreateTransferError.EmailNotAllowedError,
        this.context.transferSdk.errors.CreateTeamTransferError.EmailNotAllowedError,
        this.context.transferSdk.errors.CreateDropboxTransferError.EmailNotAllowedError,
        this.context.transferSdk.errors.CreateTransferError.InvalidAvailabilityDurationError,
        this.context.transferSdk.errors.CreateTeamTransferError.InvalidAvailabilityDurationError,
        this.context.transferSdk.errors.CreateDropboxTransferError.InvalidAvailabilityDurationError,
        this.context.transferSdk.errors.CreateTransferError.InvalidSubscriptionError,
        this.context.transferSdk.errors.CreateTeamTransferError.InvalidSubscriptionError,
        this.context.transferSdk.errors.CreateDropboxTransferError.InvalidSubscriptionError,
        this.context.transferSdk.errors.CreateTransferError.PasswordRequiredError,
        this.context.transferSdk.errors.CreateTeamTransferError.PasswordRequiredError,
        this.context.transferSdk.errors.CreateDropboxTransferError.PasswordRequiredError,
        this.context.transferSdk.errors.CreateTransferError.UsageExceededError,
        this.context.transferSdk.errors.CreateTeamTransferError.UsageExceededError,
        this.context.transferSdk.errors.CreateDropboxTransferError.OwnerUsageExceededError,
        this.context.transferSdk.errors.CreateTransferError.CustomUrlAlreadyInUseError,
        this.context.transferSdk.errors.CreateTeamTransferError.CustomUrlAlreadyInUseError,
        this.context.transferSdk.errors.CreateDropboxTransferError.CustomUrlAlreadyInUseError,
        this.context.transferSdk.errors.CreateTransferError.UnknownError,
        this.context.transferSdk.errors.CreateTeamTransferError.UnknownError,
        this.context.transferSdk.errors.CreateDropboxTransferError.UnknownError,
    ];

    protected readonly uploaderFatalErrors: typeof UploaderError[] = [];

    constructor(context: Context) {
        super(context);
        this.transfer = context.transfer!;
        if (context?.transfer?.dropboxId) {
            this.createDropboxTransferParameters = {
                size: context.transfer.size,
                language: context.transfer.language,
                availabilityDuration: context.transfer.availabilityDuration,
                title: context.transfer.title,
                delivery: context.transfer.delivery,
                customization: context.transfer.customization as CustomizationInput,
                promotion: context.transfer.promotion,
                preview: context.transfer.preview,
                accessTracking: context.transfer.accessTracking,
                password: context.transfer.password,
                notification: context.transfer.notification,
                description: context.transfer.description,
                filesNumber: context.transfer.filesNumber,
                dropboxId: context.transfer.dropboxId,
            };
        } else if (context?.transfer?.teamId) {
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
                notification: context.transfer.notification,
                description: context.transfer.description,
                filesNumber: context.transfer.filesNumber,
                teamId: context.transfer.teamId,
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
                notification: context.transfer!.notification,
                description: context.transfer!.description,
                filesNumber: context.transfer!.filesNumber,
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
                if (this.createDropboxTransferParameters) {
                    this.response = await this.context.transferSdk.createDropboxTransfer(this.createDropboxTransferParameters);
                } else if (this.createTeamTransferParameters) {
                    this.response = await this.context.transferSdk.createTeamTransfer(this.createTeamTransferParameters);
                } else if (this.createTransferParameters) {
                    this.response = await this.context.transferSdk.createTransfer(this.createTransferParameters);
                }
            } catch (error) {
                this.error = new TaskError(this, error);
            }
            resolve(this);
        });
    }

    public postProcess(context: Context): Task | null {
        this.transfer.populateCreatedTransfer(this.response);
        if (this.transfer.queue && this.transfer.queue > 0) {
            this.context.localEndOfQueueTimestamp = Date.now() + this.transfer!.queue! * 1000;
        }
        this.transfer.files.forEach(file => {
            context.createFileQueue.add(new CreateFile(context, file));
        });
        return null;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.UnauthorizedError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.UnauthorizedError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.UnauthorizedError
                ) {
                    const publicError = new UnauthorizedError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.InvalidParameterError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.InvalidParameterError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.InvalidParameterError
                ) {
                    const publicError = new InvalidParameterError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.EmailNotAllowedError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.EmailNotAllowedError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.EmailNotAllowedError
                ) {
                    const publicError = new EmailNotAllowedError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.InvalidAvailabilityDurationError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.InvalidAvailabilityDurationError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.InvalidAvailabilityDurationError
                ) {
                    const publicError = new InvalidAvailabilityDurationError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.InvalidSubscriptionError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.InvalidSubscriptionError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.InvalidSubscriptionError
                ) {
                    const publicError = new InvalidSubscriptionError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.PasswordRequiredError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.PasswordRequiredError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.PasswordRequiredError
                ) {
                    const publicError = new PasswordRequiredError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.UsageExceededError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.UsageExceededError
                ) {
                    const publicError = new UsageExceededError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.OwnerUsageExceededError
                ) {
                    const publicError = new OwnerUsageExceededError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.CustomUrlAlreadyInUseError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.CustomUrlAlreadyInUseError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.CustomUrlAlreadyInUseError
                ) {
                    const publicError = new CustomUrlAlreadyInUseError(this.error.getError() as SDKError);
                    this.error.unrecoverableError(publicError);
                } else if (
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.UnknownError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.UnknownError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.UnknownError
                ) {
                    const publicError = new UploaderError(this.error.getError() as Error)
                    this.error.unrecoverableError(publicError);
                } else {
                    const publicError = new UploaderError(this.error.getError() as Error)
                    this.error.unrecoverableError(publicError);
                }
            } else if (
                this.error.getError() instanceof this.context.transferSdk.errors.CreateTransferError.NetworkError ||
                this.error.getError() instanceof this.context.transferSdk.errors.CreateTeamTransferError.NetworkError ||
                this.error.getError() instanceof this.context.transferSdk.errors.CreateDropboxTransferError.NetworkError
            ) {
                this.error.setRecoveryTask(this.error.getTask());
            } else if (this.executionNumber < this.maxExecutionNumber) {
                this.error.setRecoveryTask(this.error.getTask());
            } else {
                const publicError = new UploaderError(this.error.getError() as Error);
                this.error.unrecoverableError(publicError);
            }
            return this.error;
        }
        throw new Error('Method task.processError() should be called only if task.isOnError() === true');
    }
}
