import { TransferFiles, CreateTransfer, UpdateTransfer, CreateDropboxTransfer } from './Transfer'

export type UploadInput = TransferFiles & (CreateTransfer | CreateDropboxTransfer);
export type UpdateInput = Partial<TransferFiles & UpdateTransfer>;