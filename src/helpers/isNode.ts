let cachedIsNode: boolean;
let called = false;
const detect = new Function('try {return this===global;}catch(e){return false;}');

export function isNode(): boolean {
    if (called) {
        return cachedIsNode;
    }
    cachedIsNode = detect();
    called = true;
    return cachedIsNode;
}

