import { SDKError, UnknownError } from 'smash-sdk-core';
import { computeDelay } from '../helpers/delay';
import { Task } from '../modules/tasks/Task';

export class TaskError {
    private task: Task;
    private error: SDKError | Error | unknown;
    private abortUpload = false;
    private recoveryTask: Task | null = null;

    constructor(task: Task, error: SDKError | UnknownError | Error | unknown) {
        this.task = task;
        this.error = error;
    }

    public getTask(): Task {
        return this.task;
    }

    public getError(): SDKError | Error | unknown {
        return this.error;
    }

    public isInstanceOfOneOfTheseErrors(sdkErrors: typeof SDKError[]): boolean {
        return sdkErrors.some(error => this.error instanceof error);
    }

    public unrecoverableError(): TaskError {
        this.abortUpload = true;
        return this;
    }

    public shouldAbortUpload(): boolean {
        return this.abortUpload;
    }

    public setRecoveryTask(recoveryTask: Task, options?: { backoffEnabled?: boolean, backoffValue?: number, delay?: number }): TaskError {
        this.recoveryTask = recoveryTask;
        this.recoveryTask.delay = computeDelay({
            executionNumber: this.recoveryTask.executionNumber,
            backoffEnabled: options?.backoffEnabled,
            backoffValue: options?.backoffValue,
            delay: options?.delay,
        });
        return this;
    }

    public getRecoveryTask(): Task | null {
        return this.recoveryTask;
    }
}
