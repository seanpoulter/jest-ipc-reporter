import { MockEventEmitter } from "./event-emitter";

export class MockSocket extends MockEventEmitter {
    connect: jest.Mock<{}> = jest.fn();
    write: jest.Mock<{}> = jest.fn();
    end: jest.Mock<{}> = jest.fn();
    destroy: jest.Mock<{}> = jest.fn();
}
