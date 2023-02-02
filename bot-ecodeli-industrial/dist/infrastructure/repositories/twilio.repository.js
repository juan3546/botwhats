"use strict";
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
require("dotenv/config");
const twilio_1 = require("twilio");
const accountSid = process.env.TWILIO_SID || "";
const authToken = process.env.TWILIO_TOKEN || "";
const fromNumber = process.env.TWILIO_FROM || "";
class TwilioService extends twilio_1.Twilio {
    constructor() {
        super(accountSid, authToken);
    }
    sendMsg({ message, phone, }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsePhone = `+${phone}`;
                const mapMsg = { body: message, to: parsePhone, from: fromNumber };
                const response = yield this.messages.create(mapMsg);
                return response;
            }
            catch (e) {
                console.log(e);
                return Promise.reject(e);
            }
        });
    }
}
exports.default = TwilioService;
