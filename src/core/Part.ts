import { UploadTransferFilePartOutput } from '@smash-sdk/transfer/10-2019/types/UploadTransferFilePart/UploadTransferFilePart';

export class Part {
    id: number;
    url?: string;
    endIndex?: number;
    startIndex?: number;
    maxChunkSize?: number;
    lengthToRead?: number;
    uploadedBytes = 0;
    urlExpiration?: string;
    etag?: string;
    crc32?: number;

    constructor({ id, url, endIndex, startIndex, maxChunkSize, lengthToRead, urlExpiration }: { id: number; url?: string; endIndex?: number; startIndex?: number; maxChunkSize?: number; lengthToRead?: number; urlExpiration?: string; }) {
        this.id = id;
        this.url = url;
        this.endIndex = endIndex;
        this.startIndex = startIndex;
        this.maxChunkSize = maxChunkSize;
        this.lengthToRead = lengthToRead;
        this.urlExpiration = urlExpiration;
        //FIX ME add status?
    }

    hydrateCreatedPart({ id, url, endIndex, startIndex, maxChunkSize, lengthToRead, urlExpiration }: { id: number; url: string; endIndex: number; startIndex: number; maxChunkSize: number; lengthToRead: number; urlExpiration: string; }): Part {
        this.id = id;
        this.url = url;
        this.endIndex = endIndex;
        this.startIndex = startIndex;
        this.maxChunkSize = maxChunkSize;
        this.lengthToRead = lengthToRead;
        this.urlExpiration = urlExpiration;
        return this;
    }

    hydrateUploadingPart({ uploadedBytes }: { uploadedBytes: number }): Part {
        this.uploadedBytes = uploadedBytes;
        return this;
    }

    hydrateUploadedPart({ part }: UploadTransferFilePartOutput): Part {
        this.crc32 = part.crc32;
        this.etag = part.etag;
        //FIX ME add status?
        return this;
    }

    hydrateCompletedPart(part: { etag: string; crc32: number; }): Part {
        this.crc32 = part.crc32;
        this.etag = part.etag;
        //FIX ME add status?
        return this;
    }

    reset() {
        this.url = undefined;
        this.endIndex = undefined;
        this.startIndex = undefined;
        this.maxChunkSize = undefined;
        this.lengthToRead = undefined;
        this.urlExpiration = undefined;
        this.uploadedBytes = 0;
        this.etag = undefined;
        this.crc32 = undefined;
    }
}
