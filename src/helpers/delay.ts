const MAX_DELAY = 30000;

export function computeDelay({ executionNumber = 0, backoffEnabled = false, backoffValue = 1000, delay = 1000 }: { executionNumber?: number, backoffEnabled?: boolean, backoffValue?: number, delay?: number } = { executionNumber: 0, backoffEnabled: false, backoffValue: 1000, delay: 1000 }): number {
    if (backoffEnabled) {
        return computeExponentialBackoff({ executionNumber, backoffValue })
    } else {
        return delay;
    }
}

function computeExponentialBackoff({ executionNumber = 0, backoffValue = 1000 }: { executionNumber?: number, backoffValue?: number } = { executionNumber: 0, backoffValue: 1000 }): number {
    const delay = Math.pow(2, executionNumber + 1) * backoffValue;
    if (delay > MAX_DELAY) {
        return MAX_DELAY;
    } else {
        return delay;
    }
}