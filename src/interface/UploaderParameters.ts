import { Region, RefreshTokenMethod } from 'smash-sdk-core';
import { VerboseLevel } from '../core/Logger';

export interface UploaderParameters {
    region: Region,
    token: string,
    verboseLevel?: VerboseLevel,
    refreshTokenMethod?: RefreshTokenMethod
    //timeout?
}
