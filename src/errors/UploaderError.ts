import { SDKError } from '@smash-sdk/core';

export class UploaderError extends Error {
    code?: number;
    error?: string;
    requestId?: string;
    details?: {
        name?: string;
        type?: string;
        reason?: string;
        expected?: string;
        given?: number;
        min?: number;
        max?: number;
        primary?: string;
        secondary?: string;
    }

    constructor(error: SDKError | Error | string | {
        message: string, 
        details?: {
            name?: string;
            type?: string;
            reason?: string;
            expected?: string;
            given?: number;
            min?: number;
            max?: number;
            primary?: string;
        }
    }) {
        super();
        if (error instanceof SDKError) {
            this.name = error.name;
            this.message = error.message;
            this.code = error.code;
            this.error = error.error;
            this.requestId = error.requestId;
            this.details = error.details;
        } else if (typeof error === 'string') {
            this.name = this.name || "UploaderError";
            this.message = error;
        } else if (error instanceof Error) {
            this.name = error.name;
            this.message = error.message;
            this.stack = error.stack;
        } else {
            this.name = this.name || 'UploaderError';
            this.message = error.message || 'Unknown uploader error';
            this.details = error.details;
        }
    }
}
