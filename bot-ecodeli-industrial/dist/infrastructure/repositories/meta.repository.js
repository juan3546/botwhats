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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const META_TOKEN = process.env.META_TOKEN || "";
const META_ID_NUMBER = process.env.META_ID_NUMBER || "";
const URL = `https://graph.facebook.com/v13.0/${META_ID_NUMBER}/messages`;
class MetaRepository {
    sendMsg({ message, phone, }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = this.parseBody({ message, phone });
                const response = yield axios_1.default.post(URL, body, {
                    headers: {
                        Authorization: `Bearer ${META_TOKEN}`,
                    },
                });
                return response.data;
            }
            catch (e) {
                return Promise.resolve(e);
            }
        });
    }
    parseBody({ message, phone }) {
        const body = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "template",
            "template": {
                "name": "hello_world",
                "language": {
                    "code": "en_US"
                }
            }
        };
        return body;
    }
}
exports.default = MetaRepository;
