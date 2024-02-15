import { isFunction } from '../helpers/isFunction';

export interface CustomEvent {
    name: string;
    data?: any;
}

export class CustomEventEmitter {
    private listeners: { [key: string]: ((event: CustomEvent) => void)[] } = {};

    public on<T>(event: string, callback: ((event: T & CustomEvent) => void)): CustomEventEmitter {
        if (isFunction(callback) === false) {
            throw new Error('Second argument of on() should be a function');
        }
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback as ((event: CustomEvent) => void));
        return this;
    }

    public off(event?: string): CustomEventEmitter {
        if (event) {
            this.listeners[event] = [];
        } else {
            this.listeners = {};
        }
        return this;
    }

    public emit(event: string, data: CustomEvent): CustomEventEmitter {
        if (Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            this.listeners[event].forEach(listener => {
                listener.call(this, data);
            });
        }
        return this;
    }

    dispatch(event: CustomEvent): CustomEventEmitter {
        return this.emit(event.name, event);
    }
}
