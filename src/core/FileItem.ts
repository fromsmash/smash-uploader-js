import fs from 'fs';
import path from 'path';
import { isNode } from '../helpers/isNode';
import { Parts } from './Parts';
import { Part } from './Part';
import { CreateTransferFilePartsOutput } from '@smash-sdk/transfer/07-2020/types/CreateTransferFileParts/CreateTransferFileParts';
import { CreateTransferFileOutput } from '@smash-sdk/transfer/07-2020/types/CreateTransferFile/CreateTransferFile';
import { UpdateTransferFilePartsOutput } from '@smash-sdk/transfer/07-2020/types/UpdateTransferFileParts/UpdateTransferFileParts';
import { UpdateTransferFileOutput } from '@smash-sdk/transfer/07-2020/types/UpdateTransferFile/UpdateTransferFile';
import { UploadTransferFilePartOutput } from '@smash-sdk/transfer/10-2019/types/UploadTransferFilePart/UploadTransferFilePart';
import { GetTeamTransferFileOutput } from '@smash-sdk/transfer/10-2019/types/GetTeamTransferFile/GetTeamTransferFile';
import { GetTransferFileOutput } from '@smash-sdk/transfer/10-2019/types/GetTransferFile/GetTransferFile';

export enum UploadeMode {
    Standard = 'Standard',
    FastUpload = 'FastUpload',
}
export class FileItem {
    id!: string;
    size: number;
    name: string;
    originalFile: File | string;
    // parts: Parts = new Parts();
    partsToCreate: Parts = new Parts();
    partsToUpload: Parts = new Parts();
    partsToComplete: Parts = new Parts();
    partsCompleted: Parts = new Parts();
    region!: string;
    chunckSize!: number;
    partsCount!: number;
    transfer!: string;
    uploadState!: string;
    maxInlineParts!: number;
    //FIX ME Manage file state ? 'Started' 'Processing' 'Complete' ... ?

    constructor(fileItem: File | string | { name: string, file: File | string }) {
        const { name, file } = this.processFileAndName(fileItem);
        if (isNode() && typeof file === 'string') {
            this.name = name;
            try {
                const { size } = fs.statSync(file);
                this.size = size;
            } catch (error) {
                throw new Error("ENOENT: No such file or directory " + file);//FIX ME improve this error
            }
            this.originalFile = file;
        } else if (file instanceof File) {
            this.name = name;
            this.size = file.size;
            this.originalFile = file;
        } else {
            throw new Error('Unsuported file type');//FIX ME TODO create a real error here, improve this
        }
    }

    private isComplexFile(file: unknown): file is { name: string, file: File | string } {
        if (file && typeof file === 'object' && 'name' in file && 'file' in file) {
            return true;
        } else {
            return false;
        }
    }

    private processFileAndName(file: File | string | { name: string, file: File | string }): { name: string, file: File | string } {
        if (this.isComplexFile(file)) {
            if (isNode() && typeof file.file === 'string') {
                return { name: file.name, file: file.file };
            } else if (file.file instanceof File) {
                return { name: file.name, file: file.file };
            } else {
                throw new Error('Unsuported file type');
            }
        } else {
            if (isNode() && typeof file === 'string') {
                const name = path.basename(file);
                return { name, file };
            } else if (file instanceof File) {
                return { name: file.name, file };
            } else {
                throw new Error('Unsuported file type');
            }
        }
    }

    public populateCreatedFile({ file }: CreateTransferFileOutput | GetTeamTransferFileOutput | GetTransferFileOutput): FileItem {
        this.id = file.id;
        this.region = file.region;
        this.transfer = file.transfer;
        this.chunckSize = file.chunkSize;
        this.partsCount = file.partsCount;
        this.uploadState = file.uploadState;
        this.maxInlineParts = file.maxInlineParts;
        this.initializePartsToCreate();
        if ('parts' in file && file.parts.length > 0) {
            this.initializePartsToUpload({ file });
        }
        return this;
    }

    public initializePartsToCreate() {
        Array.from({ length: this.partsCount }, (_, i) => i + 1).map(index => this.partsToCreate.add(new Part({ id: index })));
    }

    public initializePartsToUpload({ file: fileCreated }: CreateTransferFileOutput) {
        fileCreated.parts.forEach(part => {
            this.partsToUpload.add(new Part(part));
            this.partsToCreate.remove(part.id);
        });
    }

    // public clearPartsToCreate(): FileItem {
    //     this.partsToCreate = new Parts();
    //     return this;
    // }

    public populateCreatedParts(partsToCreate: Parts, { parts }: CreateTransferFilePartsOutput): Parts {
        const partsHydrated = new Parts();
        partsToCreate.forEach(part => {
            const partToCreate = this.partsToCreate.get(part.id);
            const createdPart = parts.find(partTofind => partTofind.id === part.id);
            if (createdPart) {
                partToCreate.hydrateCreatedPart(createdPart);
                partsHydrated.add(partToCreate);
            }
            this.partsToCreate.remove(partToCreate.id);
            this.partsToUpload.add(partToCreate);
        });
        return partsHydrated;
    }

    public populateUploadingPart(partToUpload: Part, { uploadedBytes }: { uploadedBytes: number }): Part {
        partToUpload.hydrateUploadingPart({ uploadedBytes });
        return partToUpload;
    }

    public populateUploadedPart(partToUpload: Part, { part }: UploadTransferFilePartOutput): Part { // UploadTransferFilePartOutput
        partToUpload.hydrateUploadedPart({ part });
        this.partsToUpload.remove(partToUpload.id);
        this.partsToComplete.add(partToUpload);
        return partToUpload;
    }

    public populateCompletedParts(partsToComplete: Parts, { parts }: UpdateTransferFilePartsOutput): Parts {
        partsToComplete.forEach(part => {
            const partToComplete = this.partsToComplete.get(part.id);
            const completedPart = parts.find(partTofind => partTofind.id === part.id);
            if (completedPart) {
                partToComplete.hydrateCompletedPart(completedPart);
            }
            this.partsToComplete.remove(partToComplete.id);
            this.partsCompleted.add(partToComplete);
        });
        return partsToComplete;
    }

    public populateCompletedFile({ file }: UpdateTransferFileOutput): FileItem {
        this.id = file.id;
        this.region = file.region;
        this.transfer = file.transfer;
        this.chunckSize = file.chunkSize;
        this.partsCount = file.partsCount;
        this.uploadState = file.uploadState;
        this.maxInlineParts = file.maxInlineParts;
        // if (file.parts) {
        //     file.parts.forEach(part => {
        //         const partToUpdate = this.parts.get(part.id);
        //         this.partsToComplete.remove(partToUpdate.id);
        //         this.partsCompleted.add(partToUpdate);
        //         partToUpdate.populateUpdatedPart(part);
        //     });
        // }
        return this;
    }

    public isFastUploadMode(): boolean {
        return this.uploadMode === UploadeMode.FastUpload;
    }

    public isStandardUploadMode(): boolean {
        return this.uploadMode === UploadeMode.Standard;
    }

    public getUploadMode(): UploadeMode {
        return this.uploadMode;
    }

    public get uploadMode(): UploadeMode {
        if (this.partsCount > this.maxInlineParts) {
            return UploadeMode.Standard;
        }
        return UploadeMode.FastUpload;
    }

    public hasEnoughPartsUploadedToCompleteFile(): boolean {
        return this.partsToComplete.length === this.partsCount;
    }

    public hasEnoughPartsToValidate(): boolean {
        return this.partsToComplete.slice(this.maxInlineParts - 1).length >= this.maxInlineParts;
    }

    public getPartsToValidate(): Parts {
        return this.partsToComplete.slice(this.maxInlineParts - 1);
    }

    public hasInlinePartsToValidate(): boolean {
        return Boolean(this.partsToComplete.list().slice(0, this.maxInlineParts - 1).length);
    }

    public getInlinePartsToValidate(): Parts {
        return this.partsToComplete;
    }

    public hasAllPartsUploaded(): boolean {
        return this.partsCompleted.length === this.partsCount;
    }

    public resetParts() {
        this.partsToCreate = new Parts();
        this.partsToUpload = new Parts();
        this.partsToComplete = new Parts();
        this.partsCompleted = new Parts();
        this.initializePartsToCreate();
    }
}
