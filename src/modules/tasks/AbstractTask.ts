import { SDKError } from '@smash-sdk/core';
import { Context } from '../../core/Context';
import { ContextContainer } from '../../core/ContextContainer';
import { TaskError } from '../../errors/TaskError';

export abstract class AbstractTask<T> extends ContextContainer {
    public executionNumber = 0;
    public maxExecutionNumber = 10;
    public delay = 0;
    protected readonly sdkFatalErrors: typeof SDKError[] = [];

    public error?: TaskError | null = null;

    constructor(context: Context) {
        super(context);
    }

    public isFirstTask(): boolean {
        return false;
    }

    public isLastTask(): boolean {
        return false;
    }

    public abstract preProcess(context: Context): T | null;

    public execute(): Promise<T> {
        this.clearError();
        return this.process().then(Task => {
            this.executionNumber++;
            return Task;
        });
    }

    abstract process(): Promise<T>;

    abstract postProcess(context: Context): T | null;

    public isOnError(): boolean {
        return Boolean(this.error);
    }

    protected clearError(): AbstractTask<T> {
        this.error = null;
        return this;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError();
            } else if (this.executionNumber < this.maxExecutionNumber) {
                this.error.setRecoveryTask(this.error.getTask()); // FIX ME Add delay as second optional arg....
            } else {
                this.error.unrecoverableError();
            }
            return this.error;
        }
        throw new Error('Method task.processError() should be called only if task.isOnError() === true');
    }

    public setDelay(delay: number): AbstractTask<T> {
        this.delay = delay;
        return this;
    }
}
