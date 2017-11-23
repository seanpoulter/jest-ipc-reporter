jest.mock('net');
import { MockSocket } from "./__mocks__/socket";

// Use CommonJs-style require to load custom reporter like Jest
const Reporter = require("./ipc-reporter");


const config: jest.GlobalConfig = {
    bail: false,
    collectCoverage: false,
    collectCoverageFrom: [],
    collectCoverageOnlyFrom: null,
    coverageDirectory: '',
    coverageReporters: [],
    coverageThreshold: { global: { } },
    expand: false,
    forceExit: false,
    logHeapUsage: false,
    mapCoverage: false,
    noStackTrace: false,
    notify: false,
    projects: [],
    replname: undefined,
    reporters: [],
    rootDir: '',
    silent: false,
    testNamePattern: '',
    testPathPattern: '',
    testResultsProcessor: undefined,
    updateSnapshot: 'none',
    useStderr: false,
    verbose: undefined,
    watch: false,
    watchman: false
};

const options = {
    path: 'a',
    Socket: MockSocket
};

describe('IpcReporter', () => {

    it('exports a single class', () => {
        expect(() => {
            const r = new Reporter(config, options);
            r.dispose();
        }).not.toThrow();
    });

    it('should connect to the IPC endpoint when created', () => {
        const sut = new Reporter(config, options);
        expect(sut.socket.connect.mock.calls.length).toBe(1);
        expect(sut.socket.connect).toBeCalledWith(options.path);
    });

    function testEventHandler(methodName: PropertyKey) {
        it(`should send data when "${methodName}" is called`, () => {
            const sut = new Reporter(config, options);
            sut.send = jest.fn();
            sut[methodName]();
    
            expect(sut.send).toBeCalled();
            expect(sut.send.mock.calls[0][0].type).toBe(methodName);
            expect(sut.send.mock.calls[0][0].data).toBeDefined();
        });
    }
    
    testEventHandler('onRunStart');
    testEventHandler('onTestStart');
    testEventHandler('onTestResult');
    testEventHandler('onRunComplete');

    it('should write data to the IPC endpoint', () => {
        const sut = new Reporter(config, options);
        sut.onRunStart();
        sut.onTestStart();
        sut.onTestResult();
        sut.onRunComplete();

        expect(sut.socket.write).toBeCalled();
        expect(sut.socket.write.mock.calls.length).toBe(4);
        expect(sut.socket.write.mock.calls[0][0]).toBe("{\"type\":\"onRunStart\",\"data\":{}}");
        expect(sut.socket.write.mock.calls[1][0]).toBe("{\"type\":\"onTestStart\",\"data\":{}}");
        expect(sut.socket.write.mock.calls[2][0]).toBe("{\"type\":\"onTestResult\",\"data\":{}}");
        expect(sut.socket.write.mock.calls[3][0]).toBe("{\"type\":\"onRunComplete\",\"data\":{}}");
    });

    it('should close the connection after "onRunComplete"', () => {
        const sut = new Reporter(config, options);
        sut.onRunComplete();
        expect(sut.socket.end).toBeCalled();
    });

    it('should provide a method to close the Socket', () => {
        const sut = new Reporter(config, options);
        sut.dispose();
        expect(sut.socket.destroy).toBeCalled();
        expect(sut.socket.destroy.mock.calls.length).toBe(1);
    });

    it(`shouldn't close the socket more than once`, () => {
        const sut = new Reporter(config, options);
        sut.dispose();
        sut.dispose();
        expect(sut.socket.destroy).toBeCalled();
        expect(sut.socket.destroy.mock.calls.length).toBe(1);
    })

    it('should mark the connection closed when it closes', () => {
        const sut = new Reporter(config, options);
        expect(sut.closed).toBe(false);
        sut.socket.emit('close');
        expect(sut.closed).toBe(true);
    });

    it('should default to using the net.Socket', () => {
        const sut = new Reporter(config, { path: options.path });
        expect(sut.socket).not.toBeInstanceOf(MockSocket);
        expect(sut.socket).toBeInstanceOf(require('net').Socket);
        expect(sut.socket.connect).toBeCalledWith(options.path);
    });
});
