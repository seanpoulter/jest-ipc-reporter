export class MockEventEmitter {
    private listeners: { [eventName: string]: Function[] }

    constructor() {
        this.listeners = {};
    }

    on(eventName: string, listener: Function) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(listener);
    }

    emit(eventName: string, ...args: any[]): boolean {
        const listeners = this.listeners[eventName];
        if (!listeners.length) {
            return false;
        }

        for (let i = 0; i < listeners.length; i += 1) {
            listeners[i](args);
        }
        return true;
    }
}
