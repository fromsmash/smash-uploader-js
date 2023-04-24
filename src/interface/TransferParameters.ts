export type UploadInput = TransferFiles & CreateTransfer;
export type UpdateTransferInput = TransferFiles & UpdateTransfer;
interface UpdateTransfer {
    language?: string;
    availabilityDuration?: number;
    title?: string;
    delivery?: {
        type: "Email" | "Link"
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
    preview?: "Full" | "None" ;
    accessTracking?: "Email" | "None" ;
    notificationType?: "None" | "All" ;
    password?: string;
    description?: string;
}

interface CreateTransfer extends UpdateTransfer {
    teamId?: string,
    customUrl?: string,
}

interface TransferFiles {
    files: File[] | string[] | { name: string, file: File | string }[],
}