import { SDKError } from "smash-sdk-core";

export interface BodyError {
    name: string,
    error?: string,
    details?: unknown,
}

export class UploaderError extends SDKError {
    /* public parentError?: unknown;

    getMessageToPrint() {
        return this.message;
    }

    get body(): BodyError {
        return {
            name: this.name,
            error: this.message,
            details: this.details && typeof this.details === "object" ? this.details : undefined,
        };
    }

    printError() {
        console.error(this.getMessageToPrint(), this.details ? "Details: " + this.getDetails(this.details) : "");
        return this;
    }

    getDetails(object: unknown) {
        if (typeof object === "object") {
            object = JSON.stringify(object);
        }
        return object ? object : "No details provided";
    }

    setDetails(details: unknown) {
        this.details = details;
        return this;
    }

    toJSON() {
        return this.body;
    } */
}