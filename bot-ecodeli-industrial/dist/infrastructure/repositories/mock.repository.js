"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockRepository {
    getDetail(id) {
        throw new Error("Method not implemented.");
    }
    save() {
        const MOCK_LEAD = {
            uuid: "00---000",
            message: "test",
            phone: "00000",
        };
        return Promise.resolve(MOCK_LEAD);
    }
}
exports.default = MockRepository;
