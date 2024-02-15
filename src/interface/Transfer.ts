export type Region = "us-east-1" | "us-east-2" | "us-west-1" | "us-west-2" | "ap-south-1" | "ap-northeast-3" | "ap-northeast-2" | "ap-southeast-1" | "ap-southeast-2" | "ap-northeast-1" | "ca-central-1" | "eu-central-1" | "eu-west-1" | "eu-west-2" | "eu-west-3" | "eu-north-1" | "sa-east-1" | "af-south-1" | "ap-east-1" | "ap-south-2" | "ap-southeast-3" | "eu-south-1" | "eu-south-2" | "eu-central-2" | "me-south-1" | "me-central-1";
export type Status = "Uploading" | "Processing" | "Uploaded" | "Deleting" | "Deleted" | "Expired" | "Suspended" | "Dirty";
export type Preview = "Full" | "None";
export type DeliveryType = "Email" | "Link";
export type UploadState = "Draft" | "Lock";
export type Notification = {
    sender?: { enabled: boolean },
    receiver?: { enabled: boolean },
    link?: { enabled: boolean },
    download?: { enabled: boolean },
    noDownload?: { enabled: boolean },
};
export type AccessTracking = "Email" | "None";
export type Language = "en" | "fr" | "it" | "de" | "pt" | "es";

export interface UpdateTransfer {
    language?: Language;
    availabilityDuration?: number;
    title?: string;
    delivery?: {
        type?: string;
        sender?: {
            name?: string;
            email: string;
        };
        receivers?: string[];
    };
    customization?: {
        logo?: string;
        background?: string;
    };
    promotion?: {
        id: string;
    };
    preview?: Preview;
    accessTracking?: AccessTracking;
    notification?: Notification;
    password?: string;
    description?: string;
}

export interface CreateTransfer extends UpdateTransfer {
    teamId?: string,
    customUrl?: string,
}

export interface TransferFiles {
    files: File[] | string[] | { name: string, file: File | string }[] | { name: string, content: string | Buffer }[];
}

export interface TransferBaseEventData {
    id: string;
    title?: string;
    description?: string;
    region: Region;
    status: Status;
    preview: Preview;
    transferUrl: string;
    uploadState: UploadState;
    size: number;
    filesNumber: number;
    created: string;
    modified?: string;
    //availabilityEndDate: string;
    //availabilityStartDate: string;
    availabilityDuration: number;
    queue: number;
    queuedUntil: string;
}
