import { TransferFiles, CreateTransfer, UpdateTransfer } from './Transfer'

export type UploadInput = TransferFiles & CreateTransfer;
export type UpdateInput = TransferFiles & UpdateTransfer;