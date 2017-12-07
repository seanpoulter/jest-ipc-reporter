import { EventEmitter } from 'events';

export class MockSocket extends EventEmitter {
    connect: jest.Mock<{}> = jest.fn();
    write: jest.Mock<{}> = jest.fn();
    end: jest.Mock<{}> = jest.fn();
    destroy: jest.Mock<{}> = jest.fn();
}
