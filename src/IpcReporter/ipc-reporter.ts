import { Socket } from 'net';

interface AbstractSocket {
    connect(path: string): this
    write(str: string): boolean
    end(): void
    destroy(): void
    on(eventName: string, listener: Function): void
}

interface AbstractSocketConstructor {
    new(): AbstractSocket
}

interface IpcReporterOptions {
    path: string,
    Socket?: AbstractSocketConstructor
}

interface ConnectionEvent {
    type: 'onConnect' | 'beforeEnd'
    data: {}
}

interface JestEvent {
    type: 'onRunStart' | 'onTestStart' | 'onTestResult' | 'onRunComplete'
    data: RunStarted | TestStarted | TestDone | RunDone
}

interface RunStarted {
    results: jest.AggregatedResult,
    options: jest.ReporterOnStartOptions
}

interface TestStarted {
    test: jest.Test
}

interface TestDone {
    test: jest.Test,
    testResult: jest.TestResult,
    aggregatedResult: jest.AggregatedResult
}

interface RunDone {
    contexts: Set<jest.Context>,
    results: jest.AggregatedResult
}

declare type ReportedEvent = ConnectionEvent | JestEvent


class IpcReporter implements jest.Reporter {
    private readonly options: IpcReporterOptions
    private socket: AbstractSocket
    private closed: boolean

    constructor(_: jest.GlobalConfig, options: IpcReporterOptions) {
        if (!options.Socket) {
            options.Socket = Socket;
        }
        this.options = options;

        this.connect();
        this.closed = false;
    }

    onRunStart(results: jest.AggregatedResult, options: jest.ReporterOnStartOptions): void {
        this.send({
            type: 'onRunStart',
            data: {
                results,
                options
            }
        });
    }

    onTestStart(test: jest.Test): void {
        this.send({
            type: 'onTestStart',
            data: {
                test
            }
        });
    }

    onTestResult(test: jest.Test, testResult: jest.TestResult, aggregatedResult: jest.AggregatedResult): void {
        this.send({
            type: 'onTestResult',
            data: {
                test,
                testResult,
                aggregatedResult
            }
        });
    }

    onRunComplete(contexts: Set<jest.Context>, results: jest.AggregatedResult): Promise<void> | void {
        this.send({
            type: 'onRunComplete',
            data: {
                contexts,
                results
            }
        });
        this.socket.end();
    }

    private connect(): void {
        this.socket = new this.options.Socket!();
        this.socket.connect(this.options.path);
        this.socket.on('close', () => {
            this.closed = true;
        });
    }

    private send(event: ReportedEvent): void {
        const data = JSON.stringify(event);
        this.socket.write(data);
    }

    dispose(): void {
        if (this.closed) {
            return;
        }

        this.socket.destroy();
        this.closed = true;
    }
}

export = IpcReporter;
