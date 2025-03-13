"use strict";
const jestMock = require('jest-mock');
module.exports = {
    window: {
        showInformationMessage: jestMock.fn(),
        showErrorMessage: jestMock.fn() // Added mock for error messages
    },
    workspace: {
        getConfiguration: jestMock.fn().mockReturnValue({
            get: jestMock.fn(),
            update: jestMock.fn()
        })
    },
    extensions: {
        getExtension: jestMock.fn()
    },
    commands: {
        executeCommand: jestMock.fn()
    }
};
