import { v4 as uuidv4 } from 'uuid';
import { CustomEventEmitter, CustomEvent } from '../../core/CustomEventEmitter';
import { ConnectionEvents } from '../../globals/constant';
import { Connection } from './Connection';

export class Connections extends CustomEventEmitter {
    private connections = new Map<string, Connection>();

    public updateConnectionNumber(number: number): Connection[] {
        const newConnections = [];
        if (this.length < number) {
            const length = this.length;
            for (let i = 0; i < number - length; i++) {
                newConnections.push(this.addConnection());
            }
        } else {
            throw new Error('Cannot downsize connection number, use reset() instead');
        }
        return newConnections;
    }

    public get length(): number {
        return Object.keys(this.connections).length;
    }

    public reset(): Connections {
        const length = this.length;
        for (let i = 0; i <= length; i++) {
            this.removeConnection();
        }
        return this;
    }

    public get(name: string): Connection {
        if (this.connections.get(name)) {
            return this.connections.get(name)!;
        }
        throw new Error(`Connection ${name} does not exist`);
    }

    public list(): Connection[] {
        const connections: Connection[] = [];
        for (const connection of Object.values(this.connections)) {
            connections.push(connection as Connection);
        }
        return connections;
    }

    public forEach(callback: ((connection: Connection, id?: string, connections?: Map<string, Connection>) => void)): void {
        this.connections.forEach((connection, id, connections) => {
            callback(connection, id, connections);
        })
    }

    private addConnection(): Connection {
        const name: string = uuidv4();
        this.connections.set(name, new Connection(name));
        for (const [, eventName] of Object.entries(ConnectionEvents)) {
            this.connections.get(name)!.on(eventName, (event: CustomEvent) => this.emit(eventName, event));
        }
        return this.connections.get(name)!;
    }

    private removeConnection(): Connections {
        const name: string | undefined = Object.keys(this.connections).shift();
        if (name) {
            if (this.connections.get(name)) {
                this.connections.get(name)!.off();
                this.connections.delete(name);
            }
        }
        return this;
    }

    public ping(): Connections {
        this.connections.forEach((connection) => {
            connection.ping();
        })
        return this;
    }
}


