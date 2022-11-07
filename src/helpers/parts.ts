interface Bucket {
    parts: any[],//FIX ME type
    start: number,
    end: number,
    count: number
}

export const computePartBucket = (maxInlineParts: number, partsCount: number): Bucket[] => {
    const ends = [];
    const starts = [];
    const ref = (partsCount < maxInlineParts ? partsCount : maxInlineParts);
    for (let i = ref; i <= partsCount; i += ref) {
        ends.push(i);
    }
    for (let j = 1; j <= partsCount; j += ref) {
        starts.push(j);
    }
    if (partsCount > ends[ends.length - 1]) {
        ends.push(partsCount);
    }
    const buckets = [];
    for (let k = 0; k < ends.length; k++) {
        buckets.push({
            parts: [],
            start: starts[k],
            end: ends[k],
            count: ends[k] - starts[k] + 1,
        });
    }
    return buckets;
};

interface PartsToAsk {
    id: number
}

export const scanNextParts = (localParts: number, maxInlineParts: number, partsCount: number): PartsToAsk[] => {
    const partNumberToAsk = [];
    for (let index = localParts + 1; index <= localParts + maxInlineParts; index++) {
        if (index <= partsCount) {
            partNumberToAsk.push({ id: index });
        }
    }
    return partNumberToAsk;
};

