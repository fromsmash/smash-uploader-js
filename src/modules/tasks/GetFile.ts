import { Context } from '../../core/Context';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { AbstractTask } from './AbstractTask';
import { Task } from './Task';

export class GetFile extends AbstractTask<Task> {
    private transfer: Transfer;

    constructor(context: Context) {
        super(context);
        this.transfer = context.transfer!;
        //FIX ME TODO
        /*  if (context.filesToGet.length) {
             const parameters = context.filesToGet[0];
             context.filesToGet = context.filesToGet.slice(1);
             const payload: Payload = {
                 task: TASKS.GET_FILE,
                 transferId: context.transfer.id,
                 file: parameters.file,
                 userId: parameters.userId,
             };
             return this;
         }
         return null; */
    }

    public preProcess(context: Context): Task | null {
        return this;
    }

    public process(): Promise<GetFile> {
        return new Promise(resolve => {
            try {
                //FIX ME TODO
                resolve(this);
            } catch (error) {
                this.error = new TaskError(this, error);
                resolve(this);
            }
        });
    }

    public postProcess(context: Context): Task | null {
        //FIX ME TODO
        /*        context.filesProcessing[data.response.id] = {
                   ...data.response,
                   fileId: data.response.id,
                   referenceFile: data.referenceFile,
                   localParts: data.response.parts.length,
                   uploadMethod: (data.response.partsCount < UploadMode.Number ? UploadMode.FastUpload : UploadMode.Standard), //FIX ME put in helper?
                   //UPLOAD_MODE.NUMBER => this should not be a constant
               };
               const parts = data.response.parts.map((part: any) => ({
                   ...part,
                   fileId: data.response.id,
                   sizeUploaded: 0,
               }));
               context.partsToProcess.push(...parts); */
        return null;
    }
}
