"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dependency_injection_1 = require("node-dependency-injection");
const lead_create_1 = require("../application/lead.create");
const lead_ctrl_1 = __importDefault(require("./controller/lead.ctrl"));
const mock_repository_1 = __importDefault(require("./repositories/mock.repository"));
const ws_external_1 = __importDefault(require("./repositories/ws.external"));
const container = new node_dependency_injection_1.ContainerBuilder();
/**
 * Inicamos servicio de WS / Bot / Twilio
 */
container.register("ws.transporter", ws_external_1.default);
const wsTransporter = container.get("ws.transporter");
container.register("db.repository", mock_repository_1.default);
const dbRepository = container.get("db.repository");
container
    .register("lead.creator", lead_create_1.LeadCreate)
    .addArgument([dbRepository, wsTransporter]);
const leadCreator = container.get("lead.creator");
container.register("lead.ctrl", lead_ctrl_1.default).addArgument(leadCreator);
exports.default = container;
