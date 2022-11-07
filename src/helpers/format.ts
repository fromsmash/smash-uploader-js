import moment from 'moment';

export const formatSizeWithUnit = (size: number, decimals: number = 2, unit: string = 'Octet') => {
    if (size === 0) return '0 ' + unit;

    let k = 1000,
        sizes;
    switch (unit) {
        case 'Bytes':
            // k = 1024;
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            break;

        case 'Octet':
        default:
            // k = 1000;
            sizes = ['Octet', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];
            break;
    }
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const computeSpeed = (transferStartedAt:number, totalSizeuploaded:number) => {
    const lap = Date.now();
    const duration = (lap - transferStartedAt) / 1000; // sec
    const speed = totalSizeuploaded / duration;
    return speed;
}

export const remainingTimeEstimate = (totalSizeUploaded:number, totalSizeToUpload:number, transferStartedAt:number) => {
    if (transferStartedAt) {
        const lap = Date.now();
        const remaingDataToUpload = totalSizeToUpload - totalSizeUploaded;
        const duration = (lap - transferStartedAt) / 1000; // sec
        const speed = totalSizeUploaded / duration;
        const estimation = remaingDataToUpload / speed;
        return Math.round(estimation); // remaining seconds to full upload
    } else {
        return 0;
    }
}

export const  timeDifference = (current:number, previous:number) => {
    const duration = moment.duration(previous - current);
    return `${duration.get('hours')}h ${duration.get('minutes')}m ${duration.get('seconds')}sec`
}