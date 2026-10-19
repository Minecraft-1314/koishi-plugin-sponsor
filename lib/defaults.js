"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILTIN_QR_IMAGE = exports.BUILTIN_QR_FILE = exports.BUILTIN_QR_NAME = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
exports.BUILTIN_QR_NAME = '内置二维码';
exports.BUILTIN_QR_FILE = (0, path_1.resolve)(__dirname, '../assets/builtin-qr.png');
exports.BUILTIN_QR_IMAGE = `data:image/png;base64,${(0, fs_1.readFileSync)(exports.BUILTIN_QR_FILE).toString('base64')}`;
