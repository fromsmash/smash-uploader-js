import moment from 'moment';
import { Context, Queues } from '../core/Context';
import { Task } from './tasks/Task';

type Evaluation = { key: keyof Queues, condition: ((context: Context) => boolean) | null };

export class Sequencer {
    private readonly evaluationOrder: Array<Evaluation> = [
        { key: 'taskQueue', condition: null },
        { key: 'getFileQueue', condition: null },
        { key: 'createTransferQueue', condition: null },
        { key: 'createFileQueue', condition: this.hasEnoughFilesProcessing },
        { key: 'createPartsQueue', condition: this.hasEnoughPartsProcessing },
        { key: 'uploadPartQueue', condition: null },
        { key: 'updateFileQueue', condition: null },
        { key: 'createFileQueue', condition: null }, // FIX ME this is strange this is duplicate ..... also this force to go over the value given by the api.... so we should remove it
        { key: 'lockTransferQueue', condition: null },
    ];

    private hasEnoughFilesProcessing(context: Context): boolean {
        return Boolean(context.transfer!.numberOfProcessingFiles() <= context.transfer!.parallelFiles);
    }

    private hasEnoughPartsProcessing(context: Context): boolean {
        return Boolean(context.transfer!.numberOfProcessingParts() <= context.transfer!.parallelMaxParts);
    }

    private hasOne(evaluation: Evaluation, context: Context): boolean {
        return context[evaluation.key].hasOne();
    }

    private evaluateCondition(evaluation: Evaluation, context: Context): boolean {
        if (evaluation.condition) {
            return evaluation.condition(context);
        }
        return true;
    }

    private shift(evaluation: Evaluation, context: Context): Task | null {
        return context[evaluation.key].shift();
    }

    public evaluateNextTask(context: Context): Task | null {
        if (!moment(context.transfer!.queuedUntil).isAfter(moment())) {//FIX ME queue should be handle here or not?
            for (const evaluation of this.evaluationOrder) {
                if (this.hasOne(evaluation, context) && this.evaluateCondition(evaluation, context)) {
                    const nextTask = this.shift(evaluation, context);
                    return nextTask;
                }
            }
        }
        return null;
    }
}
