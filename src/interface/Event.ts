import { CanceledEvent } from '../events/CanceledEvent';
import { FinishedEvent } from '../events/FinishedEvent';
import { FinishingEvent } from '../events/FinishingEvent';
import { QueuedEvent } from '../events/QueuedEvent';
import { StartedEvent } from '../events/StartedEvent';
import { StartingEvent } from '../events/StartingEvent';
import { StatusEvent } from '../events/StatusEvent';
import { UploadErrorEvent } from '../events/UploadErrorEvent';
import { UploadProgressEvent } from '../events/UploadProgressEvent';

export type UploaderEvent = StartedEvent | StartingEvent | QueuedEvent | StatusEvent | UploadProgressEvent | FinishingEvent | FinishedEvent | UploadErrorEvent | CanceledEvent