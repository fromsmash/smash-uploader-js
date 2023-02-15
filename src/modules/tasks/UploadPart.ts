import { UploadTransferFilePartInput, UploadTransferFilePartOutput } from '@smash-sdk/transfer/10-2019/types/UploadTransferFilePart/UploadTransferFilePart';
import fs from 'fs';
import { SDKError, UploadProgressEvent } from '@smash-sdk/core';
import { Context } from '../../core/Context';
import { FileItem } from '../../core/FileItem';
import { Part } from '../../core/Part';
import { Parts } from '../../core/Parts';
import { Transfer } from '../../core/Transfer';
import { TaskError } from '../../errors/TaskError';
import { UploaderError } from '../../helpers/errors';
import { isNode } from '../../helpers/isNode';
import { AbstractTask } from './AbstractTask';
import { CreateParts } from './CreateParts';
import { Task } from './Task';
import { UpdateFile } from './UpdateFile';
import { UpdateParts } from './UpdateParts';

export class UploadPart extends AbstractTask<Task> {
    private transfer: Transfer;
    private file: FileItem;
    private part: Part;
    callback?: (/* FIX ME */) => void;
    private response!: UploadTransferFilePartOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.UploadTransferFilePartError.BadRequest,
        this.context.transferSdk.errors.UploadTransferFilePartError.InternalServer,
        this.context.transferSdk.errors.UploadTransferFilePartError.UnknownError,
        this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchUpload, // FIX ME We should retry one time and if error occurs again, delete file and recreate it
        this.context.transferSdk.errors.UploadTransferFilePartError.AccessControlListNotSupported,
        this.context.transferSdk.errors.UploadTransferFilePartError.AccessDenied,
        this.context.transferSdk.errors.UploadTransferFilePartError.AccessPointAlreadyOwnedByYou,
        this.context.transferSdk.errors.UploadTransferFilePartError.AccountProblem,
        this.context.transferSdk.errors.UploadTransferFilePartError.AllAccessDisabled,
        this.context.transferSdk.errors.UploadTransferFilePartError.AmbiguousGrantByEmailAddress,
        this.context.transferSdk.errors.UploadTransferFilePartError.AuthorizationHeaderMalformed,
        this.context.transferSdk.errors.UploadTransferFilePartError.EntityTooSmall,
        this.context.transferSdk.errors.UploadTransferFilePartError.EntityTooLarge,
        this.context.transferSdk.errors.UploadTransferFilePartError.IllegalLocationConstraintException,
        this.context.transferSdk.errors.UploadTransferFilePartError.IllegalVersioningConfigurationException,
        this.context.transferSdk.errors.UploadTransferFilePartError.IncompleteBody,
        this.context.transferSdk.errors.UploadTransferFilePartError.InlineDataTooLarge,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidAccessKeyId,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidArgument,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidBucketName,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidBucketState,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidDigest,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidLocationConstraint,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidObjectState,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidPart,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidPayer,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidPolicyDocument,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidRange,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidSecurity,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidDigest,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidToken,
        this.context.transferSdk.errors.UploadTransferFilePartError.InvalidURI,
        this.context.transferSdk.errors.UploadTransferFilePartError.KeyTooLong,
        this.context.transferSdk.errors.UploadTransferFilePartError.MaxMessageLengthExceeded,
        this.context.transferSdk.errors.UploadTransferFilePartError.MetadataTooLarge,
        this.context.transferSdk.errors.UploadTransferFilePartError.MissingContentLength,
        this.context.transferSdk.errors.UploadTransferFilePartError.MissingRequestBody,
        this.context.transferSdk.errors.UploadTransferFilePartError.MissingSecurityHeader,
        this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchBucket,
        this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchBucketPolicy,
        this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchCORSConfiguration,
        this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchKey,
        this.context.transferSdk.errors.UploadTransferFilePartError.NotImplemented,
        this.context.transferSdk.errors.UploadTransferFilePartError.RequestHeaderSectionTooLarge,
        this.context.transferSdk.errors.UploadTransferFilePartError.ServerSideEncryptionConfigurationNotFound,
        this.context.transferSdk.errors.UploadTransferFilePartError.ServiceUnavailable,
        this.context.transferSdk.errors.UploadTransferFilePartError.UnexpectedContent,
        this.context.transferSdk.errors.UploadTransferFilePartError.UserKeyMustBeSpecified,
        UploaderError,
    ];

    constructor(context: Context, file: FileItem, part: Part) {
        super(context);
        this.transfer = context.transfer!;
        this.file = file;
        this.part = part;
    }

    public preProcess(context: Context): Task | null {
        return this;
    }

    public process(): Promise<UploadPart> {
        return new Promise(async resolve => {
            try {
                const content = await this.getContent(this.file, this.part);
                const uploadTransferFilePartParameters: UploadTransferFilePartInput = {
                    url: this.part.url as string,
                    content,
                    onUploadProgress: this.onUploadProgress.bind(this),
                };
                this.response = await this.context.transferSdk.uploadTransferFilePart(uploadTransferFilePartParameters);
            } catch (error: unknown) {
                if (error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.BadRequest ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InternalServer ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.UnknownError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchUpload || // FIX ME We should retry one time and if error occurs again, delete file and recreate it
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.AccessControlListNotSupported ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.AccessDenied ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.AccessPointAlreadyOwnedByYou ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.AccountProblem ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.AllAccessDisabled ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.AmbiguousGrantByEmailAddress ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.AuthorizationHeaderMalformed ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.EntityTooSmall ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.EntityTooLarge ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.IllegalLocationConstraintException ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.IllegalVersioningConfigurationException ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.IncompleteBody ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InlineDataTooLarge ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidAccessKeyId ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidArgument ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidBucketName ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidBucketState ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidDigest ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidLocationConstraint ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidObjectState ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidPart ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidPayer ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidPolicyDocument ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidRange ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidSecurity ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidDigest ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidToken ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidURI ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.KeyTooLong ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.MaxMessageLengthExceeded ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.MetadataTooLarge ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.MissingContentLength ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.MissingRequestBody ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.MissingSecurityHeader ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchBucket ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchBucketPolicy ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchCORSConfiguration ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.NoSuchKey ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.NotImplemented ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.RequestHeaderSectionTooLarge ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.ServerSideEncryptionConfigurationNotFound ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.ServiceUnavailable ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.UnexpectedContent ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.UserKeyMustBeSpecified ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.BadRequest ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InternalServer ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.UnknownError ||
                    // FIX ME Should not happen because we don't send any digest in header, but in future we should add CRC32 in header
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.BadDigest ||
                    // FIX ME Should not happen because we don't send any digest in header, but in future we should add CRC32 in header
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidDigest ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.ExpiredToken ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.Internal ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidToken ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.RequestTimeout ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.RequestTimeTooSkewed ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.SignatureDoesNotMatch ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.SlowDown ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.TokenRefreshRequired ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.NetworkError
                ) {
                    this.error = new TaskError(this, error);
                } else {
                    this.error = new TaskError(this, error);
                }
            }
            resolve(this);
        });
    }

    private onUploadProgress(event: UploadProgressEvent) {
        this.file.populateUploadingPart(this.part, { uploadedBytes: event.uploadedBytes });
    }

    public postProcess(context: Context): Task | null {
        this.transfer.populateUploadedPart(this.file, this.part, this.response);
        if (this.file.isFastUploadMode()) {
            if (this.file.hasEnoughPartsUploadedToCompleteFile()) {
                context.updateFileQueue.add(new UpdateFile(this.context, this.file));
            }
        } else if (this.file.isStandardUploadMode() && this.file.hasEnoughPartsToValidate()) {
            const parts = this.file.getNextPartsToValidate();
            const task = new UpdateParts(this.context, this.file, parts)
            //context.updatePartsQueue.add(task);
            return task;
        }
        return null;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError();
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.NetworkError) {
                this.error.setRecoveryTask(this.error.getTask()); // FIX ME add delay as second optional arg
            } else if (this.executionNumber < this.maxExecutionNumber &&
                (
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.Internal ||
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.RequestTimeout ||
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.RequestTimeTooSkewed ||
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.SignatureDoesNotMatch ||
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.SlowDown
                )
            ) {
                this.error.setRecoveryTask(this.error.getTask());
            } else if (
                this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.ExpiredToken ||
                this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.InvalidToken ||
                this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePartError.TokenRefreshRequired
            ) {
                this.retryPart();
            } else {
                this.error.unrecoverableError();
            }
            return this.error;
        }
        throw new Error('Method task.processError() should be called only if task.isOnError() === true');
    }

    private retryPart() {
        this.part.reset();
        this.file.partsToCreate.add(this.part);
        this.file.partsToUpload.remove(this.part.id);
        this.context.createPartsQueue.add(new CreateParts(this.context, this.file, new Parts().add(this.part)));
    }

    onProgress(callback: (/* FIX ME */) => void): UploadPart {
        this.callback = callback;
        return this;
    }

    getContent(file: FileItem, part: Part): Promise<string | Buffer | ArrayBuffer> {
        return new Promise(async (resolve, reject) => {
            try {
                const originalFile = file.originalFile;
                if (isNode()) {
                    if (typeof originalFile === 'string') {
                        const content = await this.getContentFromPath(originalFile, part);
                        resolve(content);
                    }
                } else if (originalFile instanceof File) {
                    const content = await this.getContentFromFile(originalFile, part);
                    resolve(content);
                } else {
                    // FIX ME What to do ?
                    throw new UploaderError("Unsupported file type.");
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    private getContentFromFile(originalFile: File, part: Part): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            try {
                const blob = originalFile.slice(part.startIndex, part.startIndex! + part.lengthToRead!); // FIX ME "!"
                const reader = new FileReader();
                reader.onerror = error => reject(error); // FIX ME improve error management
                reader.onabort = error => reject(error);// FIX ME is this ok to reject if abort?
                reader.onload = (onloadEvent: ProgressEvent<FileReader>) => {
                    if (onloadEvent.target?.result) { //FIX ME this can be empty?????
                        resolve(onloadEvent.target.result);//FIX ME
                    } else {
                        reject(new UploaderError('Failed to read file'));//FIX ME
                    }
                };
                reader.readAsArrayBuffer(blob);
            } catch (error) {
                reject(error);
            }
        });
    }

    private getContentFromPath(originalFile: string, part: Part): Promise<string | Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const end = part.lengthToRead! > 0 ? part.startIndex! + part.lengthToRead! - 1 : 0;
                const readStream = fs.createReadStream(originalFile, { start: part.startIndex, end }); // FIX ME "!"
                let blob = Buffer.from("");
                readStream.on('error', error => reject(error)); // FIX ME improve error management
                readStream.on('data', (chunk) => {
                    blob = Buffer.concat([blob, chunk as Buffer]);
                });
                readStream.on('end', () => {
                    resolve(blob);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}
