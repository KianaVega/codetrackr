"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const assert = __importStar(require("assert"));
const ts_mockito_1 = require("ts-mockito"); // Ensure this is the correct library for mock
const SomeClass_js_1 = require("../classes/SomeClass.js"); // Adjust the import path as needed
const vscode = __importStar(require("vscode"));
const sinon = __importStar(require("sinon"));
const mocha_1 = require("mocha"); // or 'jest'
// Example usage of mock
const myMock = (0, ts_mockito_1.mock)(SomeClass_js_1.SomeClass);
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';
(0, mocha_1.describe)('Sample Test', () => {
    (0, mocha_1.it)('should pass', () => {
        (0, chai_1.expect)(true).to.be.true;
    });
});
(0, mocha_1.suite)('Extension Test Suite', () => {
    let showMessageStub;
    (0, mocha_1.beforeEach)(() => {
        // Mocking vscode.window.showInformationMessage
        showMessageStub = sinon.stub(vscode.window, 'showInformationMessage').returns(Promise.resolve({}));
    });
    (0, mocha_1.afterEach)(() => {
        showMessageStub.restore(); // Restore the stub after each test
    });
    (0, mocha_1.test)('Sample test', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield vscode.window.showInformationMessage('Test Message');
        assert.strictEqual(result, undefined); // Or assert whatever behavior you're testing
    }));
});
