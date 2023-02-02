"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = void 0;
const uuid_1 = require("uuid");
class Lead {
    constructor({ message, phone }) {
        this.uuid = (0, uuid_1.v4)();
        this.message = message;
        this.phone = phone;
    }
}
exports.Lead = Lead;
