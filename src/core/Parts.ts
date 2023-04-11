import { Part } from './Part';

export class Parts {
    parts = new Map<number, Part>();
    _size = 0;

    public get length(): number {
        return this.parts.size;
    }

    public add(part: Part): Parts {
        if (this.parts.get(part.id)) {
            throw new Error(`Part ${part.id} already exist`);
        }
        this.parts.set(part.id, part);
        this._size = this._size + (part?.lengthToRead ? part.lengthToRead : 0)
        return this;
    }

    public get size(): number {
        return this._size;
    }

    public get sizeUploaded(): number {
        return this.list().reduce((prev, curr) => prev + curr.uploadedBytes, 0);
    }

    public has(id: number): boolean {
        return this.parts.has(id);
    }

    public get(id: number): Part {
        if (this.has(id)) {
            return this.parts.get(id)!;
        }
        throw new Error(`Part ${id} does not exist`);
    }

    public remove(id: number): Part {
        const part = this.get(id);
        this.parts.delete(id);
        if (part.lengthToRead) {
            this._size -= part.lengthToRead;
        }
        return part;
    }

    public list(): Part[] {
        const parts: Part[] = [];
        this.parts.forEach(value => {
            parts.push(value);
        })
        return parts;
    }

    public slice(start = 0, end: number = this.length - 1): Parts {
        const parts = new Parts();
        this.list().slice(start, end).forEach(part => parts.add(part));
        return parts;
    }

    public forEach(callback: ((part: Part, index?: number, parts?: Map<number, Part>) => void)): void {
        const parts = this.list();
        for (let index = 0; index < parts.length; index++) {
            callback(parts[index] as Part, index as number, this.parts);
        }

        // FIXME I don't know which is best...
        // for (let index = 0; index < this.parts.size; index++) {
        //     callback(this.parts.get(index) as Part, index as number, this.parts);
        // }
    }

    public map<T>(callback: ((part: Part, index?: number, parts?: Map<number, Part>) => T)): Array<T> {
        const collection: Array<T> = [];
        const parts = this.list();
        for (let index = 0; index < parts.length; index++) {
            collection.push(callback(parts[index], index, this.parts));
        }
        return collection;
    }
}
