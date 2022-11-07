import { CreateFile } from './CreateFile';
import { CreateParts } from './CreateParts';
import { CreateTransfer } from './CreateTransfer';
import { GetFile } from './GetFile';
import { LockTransfer } from './LockTransfer';
import { UpdateFile } from './UpdateFile';
import { UpdateParts } from './UpdateParts';
import { UploadPart } from './UploadPart';

export type Task = CreateTransfer
    | CreateFile
    | CreateParts
    | UploadPart
    | UpdateParts
    | UpdateFile
    | LockTransfer
    | GetFile;
