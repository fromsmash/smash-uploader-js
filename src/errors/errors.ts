import { UploaderError } from "./UploaderError";

export class UnsupportedFileSource extends UploaderError {
    name = "UnsupportedFileSourceError";
}
export class FileSystemNotFoundError extends UploaderError {
    name = "FileSystemNotFoundError";
}

export class FileSystemPermissionDeniedError extends UploaderError {
    name = "FileSystemPermissionDeniedError";
}

export class FileSystemUnknownError extends UploaderError {
    name = "FileSystemUnknownError";
}

export class FileReaderNotFoundError extends UploaderError {
    name = "FileReaderNotFoundError";
}

export class FileReaderSecurityError extends UploaderError {
    name = "FileReaderSecurityError";
}

export class FileReaderNotReadableError extends UploaderError {
    name = "FileReaderNotReadableError";
}

export class FileReaderUnknownError extends UploaderError {
    name = "FileReaderNotReadableError";
}

export class FileReaderAbortError extends UploaderError {
    name = "FileReaderAbortError";
}

export class FileSystemAbortError extends UploaderError {
    name = "FileSystemAbortError";
}

export class TransferAlreadyStartedError extends UploaderError {
    name = "TransferAlreadyStartedError";
}

export class EmptyFileListError extends UploaderError {
    name = "EmptyFileListError";
}

export class TransferAlreadyFinishedError extends UploaderError {
    name = "TransferAlreadyFinishedError";
}

export class UnvalidTokenError extends UploaderError {
    name = "UnvalidTokenError";
}

export class TransferIsInQueueError extends UploaderError {
    name = "TransferIsInQueueError";
}

export class NetworkError extends UploaderError {
    name = "NetworkError";
}

export class UnauthorizedError extends UploaderError {
    name = "UnauthorizedError";
}

export class InvalidParameterError extends UploaderError {
    name = "InvalidParameterError";
}

export class InvalidDeliveryError extends UploaderError {
    name = "InvalidDeliveryError";
}

export class EmailNotAllowedError extends UploaderError {
    name = "EmailNotAllowedError";
}

export class InvalidAvailabilityDurationError extends UploaderError {
    name = "InvalidAvailabilityDurationError";
}

export class InvalidSubscriptionError extends UploaderError {
    name = "InvalidSubscriptionError";
}

export class MissingReceiversError extends UploaderError {
    name = "MissingReceiversError";
}

export class MissingSenderError extends UploaderError {
    name = "MissingSenderError";
}

export class PasswordRequiredError extends UploaderError {
    name = "PasswordRequiredError";
}

export class UsageExceededError extends UploaderError {
    name = "UsageExceededError";
}

export class CustomUrlAlreadyInUseError extends UploaderError {
    name = "CustomUrlAlreadyInUseError";
}
