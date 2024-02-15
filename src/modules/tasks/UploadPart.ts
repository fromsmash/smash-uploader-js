import { SDKError, UploadProgressEvent } from '@smash-sdk/core';
import { UploadTransferFilePartInput, UploadTransferFilePartOutput } from '@smash-sdk/transfer/07-2022';
import fs from 'fs';
import { Context } from '../../core/Context';
import { FileItem } from '../../core/FileItem';
import { Part } from '../../core/Part';
import { Parts } from '../../core/Parts';
import { Transfer } from '../../core/Transfer';
import { FileReaderAbortError, FileReaderNotFoundError, FileReaderNotReadableError, FileReaderSecurityError, FileReaderUnknownError, FileSystemAbortError, FileSystemNotFoundError, FileSystemPermissionDeniedError, FileSystemUnknownError, UnsupportedFileSourceError, UnsupportedFileTypeError } from '../../errors/errors';
import { TaskError } from '../../errors/TaskError';
import { UploaderError } from '../../errors/UploaderError';
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
    private response!: UploadTransferFilePartOutput;

    protected readonly sdkFatalErrors: typeof SDKError[] = [
        this.context.transferSdk.errors.UploadTransferFilePart.BadRequestError,
        this.context.transferSdk.errors.UploadTransferFilePart.InternalServerError,
        this.context.transferSdk.errors.UploadTransferFilePart.UnknownError,
        this.context.transferSdk.errors.UploadTransferFilePart.NoSuchUploadError, // FIX ME We should retry one time and if error occurs again, delete file and recreate it
        this.context.transferSdk.errors.UploadTransferFilePart.AccessControlListNotSupportedError,
        this.context.transferSdk.errors.UploadTransferFilePart.AccessDeniedError,
        this.context.transferSdk.errors.UploadTransferFilePart.AccessPointAlreadyOwnedByYouError,
        this.context.transferSdk.errors.UploadTransferFilePart.AccountProblemError,
        this.context.transferSdk.errors.UploadTransferFilePart.AllAccessDisabledError,
        this.context.transferSdk.errors.UploadTransferFilePart.AmbiguousGrantByEmailAddressError,
        this.context.transferSdk.errors.UploadTransferFilePart.AuthorizationHeaderMalformedError,
        this.context.transferSdk.errors.UploadTransferFilePart.EntityTooSmallError,
        this.context.transferSdk.errors.UploadTransferFilePart.EntityTooLargeError,
        this.context.transferSdk.errors.UploadTransferFilePart.IllegalLocationConstraintExceptionError,
        this.context.transferSdk.errors.UploadTransferFilePart.IllegalVersioningConfigurationExceptionError,
        this.context.transferSdk.errors.UploadTransferFilePart.IncompleteBodyError,
        this.context.transferSdk.errors.UploadTransferFilePart.InlineDataTooLargeError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidAccessKeyIdError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidArgumentError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidBucketNameError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidBucketStateError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidDigestError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidLocationConstraintError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidObjectStateError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidPartError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidPayerError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidPolicyDocumentError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidRangeError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidSecurityError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidDigestError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidTokenError,
        this.context.transferSdk.errors.UploadTransferFilePart.InvalidURIError,
        this.context.transferSdk.errors.UploadTransferFilePart.KeyTooLongError,
        this.context.transferSdk.errors.UploadTransferFilePart.MaxMessageLengthExceededError,
        this.context.transferSdk.errors.UploadTransferFilePart.MetadataTooLargeError,
        this.context.transferSdk.errors.UploadTransferFilePart.MissingContentLengthError,
        this.context.transferSdk.errors.UploadTransferFilePart.MissingRequestBodyError,
        this.context.transferSdk.errors.UploadTransferFilePart.MissingSecurityHeaderError,
        this.context.transferSdk.errors.UploadTransferFilePart.NoSuchBucketError,
        this.context.transferSdk.errors.UploadTransferFilePart.NoSuchBucketPolicyError,
        this.context.transferSdk.errors.UploadTransferFilePart.NoSuchCORSConfigurationError,
        this.context.transferSdk.errors.UploadTransferFilePart.NoSuchKeyError,
        this.context.transferSdk.errors.UploadTransferFilePart.NotImplementedError,
        this.context.transferSdk.errors.UploadTransferFilePart.RequestHeaderSectionTooLargeError,
        this.context.transferSdk.errors.UploadTransferFilePart.ServerSideEncryptionConfigurationNotFoundError,
        this.context.transferSdk.errors.UploadTransferFilePart.ServiceUnavailableError,
        this.context.transferSdk.errors.UploadTransferFilePart.UnexpectedContentError,
        this.context.transferSdk.errors.UploadTransferFilePart.UserKeyMustBeSpecifiedError,
    ];

    protected readonly nativeFatalErrors: Array<typeof UploaderError> = [
        FileSystemNotFoundError,
        FileSystemPermissionDeniedError,
        FileSystemUnknownError,
        FileReaderNotFoundError,
        FileSystemAbortError,
        FileReaderSecurityError,
        FileReaderNotReadableError,
        FileReaderUnknownError,
        FileReaderAbortError,
        UnsupportedFileSourceError,
        UnsupportedFileTypeError,
    ]

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
                if (error instanceof this.context.transferSdk.errors.UploadTransferFilePart.BadRequestError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.UnknownError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.NoSuchUploadError || // FIX ME We should retry one time and if error occurs again, delete file and recreate it
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.AccessControlListNotSupportedError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.AccessDeniedError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.AccessPointAlreadyOwnedByYouError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.AccountProblemError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.AllAccessDisabledError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.AmbiguousGrantByEmailAddressError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.AuthorizationHeaderMalformedError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.EntityTooSmallError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.EntityTooLargeError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.IllegalLocationConstraintExceptionError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.IllegalVersioningConfigurationExceptionError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.IncompleteBodyError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InlineDataTooLargeError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidAccessKeyIdError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidArgumentError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidBucketNameError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidBucketStateError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidDigestError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidLocationConstraintError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidObjectStateError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidPartError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidPayerError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidPolicyDocumentError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidRangeError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidSecurityError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidDigestError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidTokenError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidURIError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.KeyTooLongError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.MaxMessageLengthExceededError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.MetadataTooLargeError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.MissingContentLengthError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.MissingRequestBodyError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.MissingSecurityHeaderError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.NoSuchBucketError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.NoSuchBucketPolicyError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.NoSuchCORSConfigurationError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.NoSuchKeyError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.NotImplementedError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.RequestHeaderSectionTooLargeError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.ServerSideEncryptionConfigurationNotFoundError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.ServiceUnavailableError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.UnexpectedContentError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.UserKeyMustBeSpecifiedError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.BadRequestError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InternalServerError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.UnknownError ||
                    // FIX ME Should not happen because we don't send any digest in header, but in future we should add CRC32 in header
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePartError.BadDigestError ||
                    // FIX ME Should not happen because we don't send any digest in header, but in future we should add CRC32 in header
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidDigestError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.ExpiredTokenError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InternalError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidTokenError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.RequestTimeoutError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.RequestTimeTooSkewedError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.SignatureDoesNotMatchError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.SlowDownError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.TokenRefreshRequiredError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.NetworkError ||
                    error instanceof this.context.transferSdk.errors.UploadTransferFilePart.EtagIsMissingError
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
            return task;
        }
        return null;
    }

    public processError(): TaskError {
        if (this.error) {
            if (this.error.isInstanceOfOneOfTheseErrors(this.sdkFatalErrors)) {
                this.error.unrecoverableError(new UploaderError(this.error.getError() as SDKError));
            } else if (this.error.isInstanceOfOneOfTheseErrors(this.nativeFatalErrors)) {
                this.error.unrecoverableError(this.error.getError() as UploaderError);
            } else if (this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.NetworkError ||
                this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.RequestTimeoutError ||
                this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.EtagIsMissingError
            ) {
                this.error.setRecoveryTask(this.error.getTask()); // FIX ME add delay as second optional arg
            } else if (this.executionNumber < this.maxExecutionNumber &&
                (
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.InternalError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.RequestTimeTooSkewedError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.SignatureDoesNotMatchError ||
                    this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.SlowDownError
                )
            ) {
                this.error.setRecoveryTask(this.error.getTask(), { backoffEnabled: true });
            } else if (
                this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.ExpiredTokenError ||
                this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.InvalidTokenError ||
                this.error.getError() instanceof this.context.transferSdk.errors.UploadTransferFilePart.TokenRefreshRequiredError
            ) {
                this.retryPart();
            } else {
                this.error.unrecoverableError(new UploaderError(this.error.getError() as Error));
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

    getContent(file: FileItem, part: Part): Promise<string | Buffer | ArrayBuffer> {
        return new Promise(async (resolve, reject) => {
            try {
                const originalFile = file.originalFile;
                const originalContent = file.originalContent;

                if (originalContent) {
                    if (typeof originalContent === 'string' || Buffer.isBuffer(originalContent)) {
                        resolve(originalContent);
                    } else {
                        reject(new UnsupportedFileSourceError(`Unsupported inlined file content. Expected 'string' or 'Buffer' as file content but got ${typeof originalContent} instead.`));
                    }
                } else if (isNode()) {
                    if (typeof originalFile === 'string') {
                        const content = await this.getContentFromPath(originalFile, part);
                        resolve(content);
                    } else {
                        reject(new UnsupportedFileSourceError(`Unsupported file source. Expected 'string' as file path but got ${typeof originalFile} instead.`));
                    }
                } else if (originalFile instanceof File) {
                    const content = await this.getContentFromFile(originalFile, part);
                    resolve(content);
                } else {
                    throw new UnsupportedFileSourceError("Unsupported file source.");
                }
            } catch (error: unknown) {
                reject(error);
            }
        });
    }

    private getContentFromFile(originalFile: File, part: Part): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            try {
                const blob = originalFile.slice(part.startIndex, part.startIndex! + part.lengthToRead!); // FIX ME "!"
                const reader = new FileReader();
                reader.onerror = (error: any) => {
                    if (error) {
                        switch (error.name) {
                            case 'NotFoundError':
                                reject(new FileReaderNotFoundError({
                                    message: `The file '${originalFile.name}' could not be found`,
                                    details: {
                                        name: "file",
                                        primary: originalFile.name,
                                    }
                                }));
                                break;
                            case 'SecurityError':
                                reject(new FileReaderSecurityError({
                                    message: `The file '${originalFile.name}' cannot be accessed due to security restrictions`,
                                    details: {
                                        name: "file",
                                        primary: originalFile.name,
                                    }
                                }));
                                break;
                            case 'NotReadableError':
                                reject(new FileReaderNotReadableError({
                                    message: `The file '${originalFile.name}' is not readable or the user has denied permission`,
                                    details: {
                                        name: "file",
                                        primary: originalFile.name,
                                    }
                                }));
                                break;
                            default:
                                reject(new FileReaderUnknownError({
                                    message: `An unknown error occurred while reading the file '${originalFile.name}'`,
                                    details: {
                                        name: "file",
                                        primary: originalFile.name,
                                    }
                                }));
                                break;
                        };
                    } else {
                        reject(new FileReaderUnknownError({
                            message: `An unknown error occurred while reading the file '${originalFile.name}'`,
                            details: {
                                name: "file",
                                primary: originalFile.name,
                            }
                        }));
                    };
                }
                reader.onabort = () => reject(new FileReaderAbortError({
                    message: `The file reading was aborted for file '${originalFile.name}'`,
                    details: {
                        name: "file",
                        primary: originalFile.name,
                    }
                }));
                reader.onload = (onloadEvent: ProgressEvent<FileReader>) => {
                    if (onloadEvent.target?.result) {
                        resolve(onloadEvent.target.result); // FIX ME
                    } else {
                        reject(new FileReaderUnknownError({
                            message: `An unknown error occurred while reading the file '${originalFile.name}'`,
                            details: {
                                name: "file",
                                primary: originalFile.name,
                            }
                        }));
                    }
                };
                reader.readAsArrayBuffer(blob);
            } catch (error: unknown) {
                reject(error);
            }
        });
    }

    private getContentFromPath(originalFile: string, part: Part): Promise<string | Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const end = part.lengthToRead! > 0 ? part.startIndex! + part.lengthToRead! - 1 : 0; // FIX ME "!"
                const readStream = fs.createReadStream(originalFile, { start: part.startIndex, end });
                let blob = Buffer.from("");
                readStream.on('error', (error: NodeJS.ErrnoException) => { // We shoud
                    if (error.code === 'ENOENT') {
                        reject(new FileSystemNotFoundError({
                            message: `File not found: ${originalFile}`,
                            details: {
                                name: "file",
                                primary: originalFile,
                            }
                        }));
                    } else if (error.code === 'EACCES') {
                        reject(new FileSystemPermissionDeniedError({
                            message: `Permission denied: ${originalFile}`,
                            details: {
                                name: "file",
                                primary: originalFile,
                            }
                        }));
                    } else {
                        reject(new FileSystemUnknownError({
                            message: `An error occurred while reading file: ${originalFile}`,
                            details: {
                                name: "file",
                                primary: originalFile,
                            }
                        }));
                    }
                });
                readStream.on('data', (chunk) => {
                    blob = Buffer.concat([blob, chunk as Buffer]);
                });
                readStream.on('abort', () => {
                    reject(new FileSystemAbortError({
                        message: `File read operation was aborted: ${originalFile}`,
                        details: {
                            name: "file",
                            primary: originalFile,
                        }
                    }));
                });
                readStream.on('end', () => {
                    resolve(blob);
                });
            } catch (error: unknown) {
                reject(error);
            }
        });
    }
}
