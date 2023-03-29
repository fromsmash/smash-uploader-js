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
    partsToCreate: Parts = new Parts();
    partsToUpload: Parts = new Parts();
    partsToComplete: Parts = new Parts();
    completingParts: Parts = new Parts();
    inlinePartsToComplete: Parts = new Parts();
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
        if (this.canAddInlinePart()) {

            this.inlinePartsToComplete.add(partToUpload);
        } else {
            this.partsToComplete.add(partToUpload);
        }
        return partToUpload;
    }

    private getPartTocomplete(part: Part): Part {
        if (this.inlinePartsToComplete.has(part.id)) {
            const partToComplete = this.inlinePartsToComplete.get(part.id);
            this.inlinePartsToComplete.remove(partToComplete.id);
            return partToComplete;
        } else {
            const partToComplete = this.completingParts.get(part.id);
            this.completingParts.remove(partToComplete.id);
            return partToComplete;
        }
    }

    public populateCompletedParts(partsToComplete: Parts, { parts }: UpdateTransferFilePartsOutput): Parts {
        partsToComplete.forEach(part => {
            const partToComplete = this.getPartTocomplete(part);
            const completedPart = parts.find(partTofind => partTofind.id === part.id);
            if (completedPart) {
                partToComplete.hydrateCompletedPart(completedPart);
            }
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

    public canAddInlinePart(): boolean {
        return this.inlinePartsToComplete.length < this.maxInlineParts;
    }

    public hasEnoughPartsUploadedToCompleteFile(): boolean {
        return this.partsToComplete.length + this.inlinePartsToComplete.length === this.partsCount;
    }

    public hasEnoughPartsToValidate(): boolean {
        return this.partsToComplete.length >= this.maxInlineParts || (this.partsToComplete.length > 0 && this.partsCount - this.maxInlineParts - this.completingParts.length - this.partsCompleted.length === this.partsToComplete.length);
    }

    public getPartsToValidate(): Parts {
        return this.partsToComplete;
    }

    public getNextPartsToValidate(): Parts {
        const parts = this.partsToComplete.slice(0, this.maxInlineParts - 1);
        parts.forEach(part => {
            this.partsToComplete.remove(part.id);
            this.completingParts.add(part);
        });
        return parts;
    }

    public hasInlinePartsToValidate(): boolean {
        return Boolean(this.inlinePartsToComplete.list().length);
    }

    public getInlinePartsToValidate(): Parts {
        return this.inlinePartsToComplete;
    }

    public hasAllPartsUploaded(): boolean {
        return this.partsCompleted.length + this.inlinePartsToComplete.length === this.partsCount;
    }

    public resetParts() {
        this.partsToCreate = new Parts();
        this.partsToUpload = new Parts();
        this.partsToComplete = new Parts();
        this.inlinePartsToComplete = new Parts();
        this.completingParts = new Parts();
        this.partsCompleted = new Parts();
        this.initializePartsToCreate();
    }
}
