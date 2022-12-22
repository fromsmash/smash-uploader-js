import { FileItem } from './FileItem';
export class Files {
    files = new Map<string, FileItem>();
    _size = 0;

    constructor(files?: File[] | string[] | { name: string, file: File | string }[]) {
        if (files) {
            //FIX ME do dynamic sanity check with joi
            for (const key in files) {
                const file = new FileItem(files[key]);
                this.add(file);
            }
        }
    }

    public get length(): number {
        return this.files.size;
    }

    public get size(): number {
        return this._size;
    }

    public add(file: FileItem): Files {
        if (this.files.get(file.name)) {
            throw new Error(`File ${file.name} already exist`);
        }
        this.files.set(file.name, file);
        this._size += file.size;
        return this;
    }

    public get(name: string): FileItem {
        if (this.files.get(name)) {
            return this.files.get(name)!;
        }
        throw new Error(`File ${name} does not exist`);
    }

    public has(name: string): boolean {
        if (this.files.get(name)) {
            return true;
        }
        return false;
    }

    public remove(name: string): FileItem {
        const file = this.get(name);
        this.files.delete(name)!;
        return file;
    }

    public list(): FileItem[] {
        const files: FileItem[] = [];
        this.files.forEach(value => {
            files.push(value);
        })
        return files;
    }

    public forEach(callback: ((file: FileItem, index?: number, files?: Map<string, FileItem>) => void)): void {
        const files = this.list();
        for (let index = 0; index < files.length; index++) {
            callback(files[index] as FileItem, index as number, this.files);
        }
    }
}
