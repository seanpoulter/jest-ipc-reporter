# jest-ipc-reporter

This is a custom reporter for Jest that sends the results to another process using IPC. To use this reporter, add it to your Jest configuration and specify an `IPC path`:
```json
{
    reporters: [
        ["<rootDir>/dist/ipc-reporter", { path: "IPC path" } ],
        "default"
    ],
}
```

## Message Format

When the `onRunStart`, `onTestStart`, `onTestResult`, and `onRunComplete` methods are called, the arguments are sent in a JSON message like:
```json
{
    "type": "methodName",
    "data": {
        "argName": "argValue",
        ...
    }
}
```
