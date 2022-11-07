export enum VerboseLevel {
    Log = 'Log',
    Info = 'Info',
    Warn = 'Warn',
    Error = 'Error',
    None = 'None',
}

export class Logger {
    private readonly levels: VerboseLevel[] = [VerboseLevel.Log, VerboseLevel.Info, VerboseLevel.Warn, VerboseLevel.Error, VerboseLevel.None];

    private verboseLevel: VerboseLevel;

    constructor(verboseLevel = VerboseLevel.None) {
        if (this.levels.indexOf(verboseLevel) === -1) {
            throw new Error(`Verbose level ${verboseLevel} not supported`);
        }
        this.verboseLevel = verboseLevel;
    }

    private hasVerboseLevel(level: VerboseLevel) {
        const currentVerboseValue = this.levels.indexOf(level);
        const configuredVerboseValue = this.levels.indexOf(this.verboseLevel);
        return currentVerboseValue - configuredVerboseValue >= 0;
    }

    public assert(...args: any[]): void {
        console.assert(...args);
    }

    public clear(): void {
        console.clear();
    }

    public count(...args: any[]): void {
        console.count(...args);
    }

    public countReset(...args: any[]): void {
        console.countReset(...args);
    }

    public debug(...args: any[]): void {
        if (this.hasVerboseLevel(VerboseLevel.Log)) {
            console.debug(...args);
        }
    }

    public dir(...args: any[]): void {
        console.dir(...args);
    }

    public dirxml(...args: any[]): void {
        console.dirxml(...args);
    }

    public error(...args: any[]): void {
        if (this.hasVerboseLevel(VerboseLevel.Error)) {
            console.error(...args);
        }
    }

    public group(...args: any[]): void {
        console.group(...args);
    }

    public groupCollapsed(...args: any[]): void {
        console.groupCollapsed(...args);
    }

    public groupEnd(): void {
        console.groupEnd();
    }

    public info(...args: any[]): void {
        if (this.hasVerboseLevel(VerboseLevel.Info)) {
            console.info(...args);
        }
    }

    public log(...args: any[]): void {
        if (this.hasVerboseLevel(VerboseLevel.Log)) {
            console.log(...args);
        }
    }

    public profile(...args: any[]): void {
        console.profile(...args);
    }

    public profileEnd(...args: any[]): void {
        console.profileEnd(...args);
    }

    public table(...args: any[]): void {
        console.table(...args);
    }

    public time(...args: any[]): void {
        console.time(...args);
    }

    public timeEnd(...args: any[]): void {
        console.timeEnd(...args);
    }

    public timeLog(...args: any[]): void {
        console.timeLog(...args);
    }

    public timeStamp(...args: any[]): void {
        console.timeStamp(...args);
    }

    public trace(...args: any[]): void {
        if (this.hasVerboseLevel(VerboseLevel.Log)) {
            console.trace(...args);
        }
    }

    public warn(...args: any[]): void {
        if (this.hasVerboseLevel(VerboseLevel.Warn)) {
            console.warn(...args);
        }
    }
}
