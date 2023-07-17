export type Region = "us-east-1" | "us-east-2" | "us-west-1" | "us-west-2" | "ap-south-1" | "ap-northeast-3" | "ap-northeast-2" | "ap-southeast-1" | "ap-southeast-2" | "ap-northeast-1" | "ca-central-1" | "eu-central-1" | "eu-west-1" | "eu-west-2" | "eu-west-3" | "eu-north-1" | "sa-east-1" | "af-south-1" | "ap-east-1" | "ap-south-2" | "ap-southeast-3" | "eu-south-1" | "eu-south-2" | "eu-central-2" | "me-south-1" | "me-central-1";
export type Status = "Uploading" | "Processing" | "Uploaded" | "Deleting" | "Deleted" | "Expired" | "Suspended" | "Dirty";
export type Preview = "Full" | "None";
export type DeliveryType = "Email" | "Link";
export type UploadState = "Draft" | "Lock";
export type NotificationType = "All" | "None";
export type AccessTracking = "Email" | "None";

export interface UpdateTransfer {
    language?: string;
    availabilityDuration?: number;
    title?: string;
    delivery?: {
        type: DeliveryType;
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
    notificationType?: NotificationType;
    password?: string;
    description?: string;
}

export interface CreateTransfer extends UpdateTransfer {
    teamId?: string,
    customUrl?: string,
}

export interface TransferFiles {
    files: File[] | string[] | { name: string, file: File | string }[],
}
