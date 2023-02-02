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
exports.LeadCreate = void 0;
class LeadCreate {
    constructor(respositories) {
        const [leadRepository, leadExternal] = respositories;
        this.leadRepository = leadRepository;
        this.leadExternal = leadExternal;
    }
    sendMessageAndSave({ message, phone, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const responseDbSave = yield this.leadRepository.save({ message, phone }); //TODO DB
            const responseExSave = yield this.leadExternal.sendMsg({ message, phone }); //TODO enviar a ws
            return { responseDbSave, responseExSave };
        });
    }
}
exports.LeadCreate = LeadCreate;
