import { CreateTransferFileOutput } from '@smash-sdk/transfer/07-2020/types/CreateTransferFile/CreateTransferFile';
import { CreateTransferFilePartsOutput } from '@smash-sdk/transfer/07-2020/types/CreateTransferFileParts/CreateTransferFileParts';
import { LockTransferOutput } from '@smash-sdk/transfer/07-2020/types/LockTransfer/LockTransfer';
import { UpdateTransferFileOutput } from '@smash-sdk/transfer/07-2020/types/UpdateTransferFile/UpdateTransferFile';
import { UpdateTransferFilePartsOutput } from '@smash-sdk/transfer/07-2020/types/UpdateTransferFileParts/UpdateTransferFileParts';
import { CreateTeamTransferOutput } from '@smash-sdk/transfer/10-2019/types/CreateTeamTransfer/CreateTeamTransfer';
import { CreateTransferOutput } from '@smash-sdk/transfer/10-2019/types/CreateTransfer/CreateTransfer';
import { GetTeamTransferOutput } from '@smash-sdk/transfer/10-2019/types/GetTeamTransfer/GetTeamTransfer';
import { GetTeamTransferFileOutput } from '@smash-sdk/transfer/10-2019/types/GetTeamTransferFile/GetTeamTransferFile';
import { GetTransferOutput } from '@smash-sdk/transfer/10-2019/types/GetTransfer/GetTransfer';
import { GetTransferFileOutput } from '@smash-sdk/transfer/10-2019/types/GetTransferFile/GetTransferFile';
import { UpdateTransferOutput } from '@smash-sdk/transfer/10-2019/types/UpdateTransfer/UpdateTransfer';
import { UploadTransferFilePartOutput } from '@smash-sdk/transfer/10-2019/types/UploadTransferFilePart/UploadTransferFilePart';
import { CreateTransferParameters } from '../interface/TransferParameters';
import { FileItem } from './FileItem';
import { Files } from './Files';
import { Part } from './Part';
import { Parts } from './Parts';

type CustomizationOutput = {
    logo?: {
        type: string;
        sourceId: string;
        sourceUrl: string;
        thumbnail: string;
    },
    background?: {
        type: string;
        sourceId: string;
        sourceUrl: string;
        thumbnail: string;
    },
};

export type CustomizationInput = {
    logo?: string,
    background?: string,
}

export class Transfer {
    public files: Files;
    public filesProcessing: Files = new Files();
    public filesCompleted: Files = new Files();
    public id!: string;
    public status!: string;
    public region!: string;
    public transferUrl?: string;
    public uploadState?: string;
    public created?: string;
    public modified?: string;
    public deleted?: string;
    public teamId?: string;
    public domain?: string;
    public customUrl?: string;
    public language?: string;
    public availabilityStartDate?: string;
    public availabilityDuration?: number;
    public availabilityEndDate?: string;
    public title?: string;
    public queue?: number;
    public queuedUntil?: string;
    public delivery?: {
        type: string,
        sender?: {
            name?: string,
            email: string,
        },
        receivers?: string[]
    };

    public customization?: CustomizationInput | CustomizationOutput;

    public promotion?: {
        id: string,
    };

    public preview?: string;
    public accessTracking?: string;
    public notificationType?: string;
    public password?: string;
    public description?: string;
    public parallelFiles!: number;
    public parallelMinParts!: number;
    public parallelMaxParts!: number;
    public parallelConnections!: number;

    constructor(transferParameters: CreateTransferParameters) {
        //sanity check transferParameters with joi
        this.files = new Files(transferParameters.files);
        if (transferParameters) {
            this.teamId = transferParameters.teamId;
            this.customUrl = transferParameters.customUrl;
            this.language = transferParameters.language;
            this.availabilityDuration = transferParameters.availabilityDuration;
            this.title = transferParameters.title;
            this.delivery = transferParameters.delivery;
            if (transferParameters.customization) {
                this.customization = {};
                if (typeof transferParameters?.customization?.logo === 'string') {
                    this.customization.logo = transferParameters.customization.logo;
                }
                if (typeof transferParameters?.customization?.background === 'string') {
                    this.customization.background = transferParameters.customization.background;
                }
            }
            this.promotion = transferParameters.promotion;
            this.preview = transferParameters.preview;
            this.accessTracking = transferParameters.accessTracking;
            this.notificationType = transferParameters.notificationType;
            this.password = transferParameters.password;
            this.description = transferParameters.description;
        }
    }

    public get size(): number {
        return this.files.size;
    }

    public get filesNumber(): number {
        return this.files.length;
    }

    public populateCreatedTransfer({ transfer }: CreateTransferOutput | CreateTeamTransferOutput): Transfer {
        this.id = transfer.id;
        this.title = transfer.title;
        this.status = transfer.status;
        this.region = transfer.region;
        this.preview = transfer.preview;
        this.created = transfer.created;
        this.deleted = transfer.deleted;
        this.modified = transfer.modified;
        this.language = transfer.language;
        this.transferUrl = transfer.transferUrl;
        this.uploadState = transfer.uploadState;
        this.description = transfer.description;
        this.promotion = transfer.promotion;
        this.customization = transfer.customization;
        this.parallelFiles = transfer.parallelFiles;
        this.parallelMinParts = transfer.parallelMinParts;
        this.parallelMaxParts = transfer.parallelMaxParts;
        this.parallelConnections = transfer.parallelConnections;
        this.availabilityEndDate = transfer.availabilityEndDate;
        this.availabilityDuration = transfer.availabilityDuration;
        this.availabilityStartDate = transfer.availabilityStartDate;
        this.delivery = transfer.delivery;
        this.queue = transfer.queue;
        this.queuedUntil = transfer.queuedUntil;
        return this;
    }

    public populateUpdatedTransfer({ transfer }: UpdateTransferOutput): Transfer {
        this.title = transfer.title;
        this.status = transfer.status;
        this.region = transfer.region;
        this.created = transfer.created;
        this.deleted = transfer.deleted;
        this.modified = transfer.modified;
        this.language = transfer.language;
        this.transferUrl = transfer.transferUrl;
        this.uploadState = transfer.uploadState;
        this.description = transfer.description;
        this.promotion = transfer.promotion;
        this.customization = transfer.customization;
        this.availabilityEndDate = transfer.availabilityEndDate;
        this.availabilityDuration = transfer.availabilityDuration;
        this.availabilityStartDate = transfer.availabilityStartDate;
        this.delivery = transfer.delivery;
        this.queue = transfer.queue;
        this.queuedUntil = transfer.queuedUntil;
        return this;
    }

    public populateCreatedFile(fileToCreate: FileItem, { file }: CreateTransferFileOutput | GetTransferFileOutput | GetTeamTransferFileOutput): FileItem {
        fileToCreate.populateCreatedFile({ file } as CreateTransferFileOutput | GetTransferFileOutput | GetTeamTransferFileOutput);
        this.filesProcessing.add(fileToCreate);
        return fileToCreate;
    }

    public populateCreatedParts(fileToUpdate: FileItem, partsToCreate: Parts, { parts }: CreateTransferFilePartsOutput): Parts {
        const createdParts = fileToUpdate.populateCreatedParts(partsToCreate, { parts });
        return createdParts;
    }

    public populateUploadedPart(fileToUpdate: FileItem, partToUpdate: Part, { part }: UploadTransferFilePartOutput): Part { // UploadTransferFilePartOutput
        fileToUpdate.populateUploadedPart(partToUpdate, { part });
        return partToUpdate;
    }

    public populateCompletedParts(fileToUpdate: FileItem, partsToComplete: Parts, { parts }: UpdateTransferFilePartsOutput): Parts {
        fileToUpdate.populateCompletedParts(partsToComplete, { parts });
        return partsToComplete;
    }

    public populateCompletedFile(fileToUpdate: FileItem, { file }: UpdateTransferFileOutput): FileItem {
        this.filesCompleted.add(fileToUpdate);
        this.filesProcessing.remove(fileToUpdate.name);
        fileToUpdate.populateCompletedFile({ file });
        return fileToUpdate;
    }

    public populateLockedTransfer({ transfer }: LockTransferOutput | GetTransferOutput | GetTeamTransferOutput): Transfer {
        this.id = transfer.id;
        this.title = transfer.title;
        this.status = transfer.status;
        this.region = transfer.region;
        this.domain = transfer.domain;
        this.preview = transfer.preview;
        this.created = transfer.created;
        this.deleted = transfer.deleted;
        this.modified = transfer.modified;
        this.language = transfer.language;
        this.transferUrl = transfer.transferUrl;
        this.uploadState = transfer.uploadState;
        this.description = transfer.description;
        this.availabilityEndDate = transfer.availabilityEndDate;
        this.availabilityDuration = transfer.availabilityDuration;
        this.availabilityStartDate = transfer.availabilityStartDate;
        this.delivery = transfer.delivery;
        return this;
    }

    public hasAllFilesUploaded(): boolean {
        return this.filesCompleted.length === this.filesNumber;
    }

    public numberOfProcessingFiles(): number {
        return this.filesProcessing.length;
    }

    public numberOfProcessingParts(): number {
        return this.filesProcessing.list().reduce((prev, curr) => prev + curr.partsToUpload.length, 0);
    }

    public isFileUploaded(file: FileItem): boolean {
        return this.filesCompleted.has(file.name);
    }
}
