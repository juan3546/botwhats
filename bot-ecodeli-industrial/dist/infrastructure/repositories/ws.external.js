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
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qr_image_1 = require("qr-image");
const axios_1 = __importDefault(require("axios"));
const process_1 = __importDefault(require("process"));
/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends whatsapp_web_js_1.Client {
    constructor() {
        super({
            authStrategy: new whatsapp_web_js_1.LocalAuth(),
            puppeteer: { headless: true }
        });
        this.url = 'http://www.limpiezamexico.mx/ApiRest/APIPaginaIndustrial/v1/paginaIndustrial/sp_WhatsAppBot'; //url de api para consultar informacion del usuario INDUSTRIAL
        this.urlComercial = 'https://www.cleanclean.mx/ApiRest/APIModuloRH/v1/ModuloRH/sp_WhatsAppBot'; //url de api para consultar informacion del usuario COMERCIAL
        this.status = false;
        this.arrayTelefonos = []; //array donde se alamcen los telefonos 
        this.arrayUsuarios = {}; // Array que contiene todos los usuarios que enteractuan con el bot y la api 
        this.mensajeIndustrial = '**!Bienvenido al asistencia virtual de Ecodeli¡** \n \n A continuación se muestra menu de opciones disponibles \n \n *0*.- 📋 Control de Asistencia \n *1*.- 💬 Quejas y Sugerencias \n *2*.- 🏃 Salir \n \n Escribe el **numero** de la opcion';
        this.mensajeComercial = '**!Bienvenido al asistencia virtual de Ecodeli¡** \n \n A continuación se muestra menu de opciones disponibles \n \n *0*.- 📊 Evaluacion 360° \n *1*.- 💬 Quejas y Sugerencias \n *2*.- 🏃 Salir \n \n Escribe el **numero** de la opcion';
        this.botonesIndustrial = [{ body: 'Control de Asistencia' }, { body: 'Evaluacion 360' }, { body: 'Quejas o Sugerencias' }];
        this.botonesComercial = [{ body: 'Evaluacion 360' }, { body: 'Quejas o Sugerencias' }, { body: 'Salir' }];
        /**
         *
         * @param base64 Metodo que genera el codigo qr que lee el telefono donde se van a responder todos los mensajes
         */
        this.generateImage = (base64) => {
            const path = `${process_1.default.cwd()}/tmp`;
            let qr_svg = (0, qr_image_1.image)(base64, { type: "svg", margin: 4 });
            qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
            console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
            console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
        };
        //Funcion para que no se interrupta la ejecucion en el servidor heroku
        setInterval(function () {
            axios_1.default.get("https://ecodeli-bot.herokuapp.com/").catch(function (error) {
                console.log(error);
            });
        }, 1500000); // cada 25 minutos (1500000)
        /**
        * Metodo que escucha todos los mensajes que le llegan al telefono servidor
        */
        this.EM = () => this.on('message', (msg) => __awaiter(this, void 0, void 0, function* () {
            const { from, body, hasMedia, type, isForwarded } = msg; // variable sostenidas del mensaje entrante
            const telefono = from.split('@');
            /**
             * Empieza la validacion del flujo princiapal del bot
            */
            //console.log(msg)
            if (this.arrayUsuarios[telefono[0]] === undefined) { //si el usuario no ha enviado mensajes entra aqui
                let data = {
                    "strAccion": "checkingInfo",
                    "strTelefono": telefono[0]
                };
                axios_1.default.post(this.url, data)
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    console.log(response.data);
                    if (response.data != '') {
                        //se construe el usuario en el arreglo
                        this.arrayUsuarios[telefono[0]] = { "estado": 'Activo', "menu": '', "opcion": '', "entrada": false, "data": response.data, "queja": false, "sugerencia": false };
                        let buttons = new whatsapp_web_js_1.Buttons('A continuación se muestra el 📋 menu con las opciones disponibles\n\n Puedes seleccionar la opcion que gustes.\n', [{ body: 'Control de Asistencia', id: 'controlAsistencia' }, { body: "Evaluación 360", id: 'evaluacion360' }, { body: "Quejas o Sugerencias", id: 'quejasSugerencias' }, { body: "Salir", id: 'salir' }], '!HOLA¡ TE DAMOS LA BIENVENIDA AL ASISTENTE VIRTUAL DE ECODELI  INDUSTRIAL 🤖*\n', '  ¿En que proceso te puedo ayudar? ');
                        this.sendMessage(from, buttons);
                    }
                    else {
                        let dataComercial = {
                            "strAccion": "checkingInfo",
                            "strTelefono": telefono[0]
                        };
                        axios_1.default.post(this.urlComercial, dataComercial).then((response) => __awaiter(this, void 0, void 0, function* () {
                            console.log(response.data);
                            if (response.data != '') {
                                this.arrayUsuarios[telefono[0]] = { "estado": 'ActivoComercial', "menu": '', "opcion": '', "entrada": false, "data": response.data, "queja": false, "sugerencia": false };
                                let buttonsComercial = new whatsapp_web_js_1.Buttons('A continuación se muestra el 📋 menu con las opciones disponibles\n\n Puedes seleccionar la opcion que gustes.\n', [{ body: "Evaluación 360", id: 'evaluacion360' }, { body: "Quejas o Sugerencias", id: 'quejasSugerencias' }, { body: "Salir", id: 'salir' }], '!HOLA¡ TE DAMOS LA BIENVENIDA AL ASISTENTE VIRTUAL DE ECODELI COMERCIAL🤖*\n', '  ¿En que proceso te puedo ayudar? ');
                                this.sendMessage(from, buttonsComercial);
                            }
                            else {
                                let media = whatsapp_web_js_1.MessageMedia.fromFilePath(`${__dirname}/../../assets/error2.png`);
                                this.sendMessage(from, media);
                            }
                        }));
                    }
                }))
                    .catch(function (error) {
                    console.log(error);
                });
            }
            //Si el usuario ya interactuo por lo menos una vez entra qui
            else if (this.arrayUsuarios[telefono[0]]["estado"] == "Activo") {
                switch (body) {
                    //Apartado para que se registre entradas y salidas de los empleados
                    case "Control de Asistencia":
                        let buttons = new whatsapp_web_js_1.Buttons('   ¿Que deseas registrar?', [{ body: 'Entrada' }, { body: 'Salida' }, { body: 'Regresar' }], "*HOLA! " + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + "* \n Elegiste control de asistencia*");
                        this.sendMessage(from, buttons);
                        this.arrayUsuarios[telefono[0]]["opcion"] = 'controlAsistencia';
                        this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
                        break;
                    //Apartado para el registro de quejas y sugerencias
                    case "Quejas o Sugerencias":
                        let botones = new whatsapp_web_js_1.Buttons(' ¿Que deseas registrar?', [{ body: 'Queja' }, { body: 'Sugerencia' }, { body: 'Salir' }], '**QUEJAS Y/O SUGERENCIAS**');
                        this.sendMessage(from, botones);
                        this.arrayUsuarios[telefono[0]]["opcion"] = 'quejas';
                        this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
                        break;
                    //obtencion de link para contestar evaluacion 360
                    case "Evaluación 360":
                        let botonesEvaluacion = new whatsapp_web_js_1.Buttons(' Evaluacion 360°', [{ body: 'Regresar a menu', id: 'regresar' }, { body: "Salir", id: 'salir' }], "*HOLA! " + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + "*", 'Este es tu enlace personalizado para responder la(s) evaluación(es).\n\n **POR FAVOR NO COMPARTIRLO**\n\n https://ecodeli-industrial.com/Evaluacion360/listado/' + telefono[0]);
                        this.sendMessage(from, botonesEvaluacion);
                        break;
                    //salir de interactuar con el bot
                    case "Salir":
                        this.sendMessage(from, "Hasta pronto 👋👋👋👋👋👋");
                        this.arrayUsuarios[telefono[0]] = undefined;
                        break;
                    default:
                        let buttonsss = new whatsapp_web_js_1.Buttons('\nA continuación se muestra el 📋 menu con las opciones disponibles\n\n Puedes seleccionar la opcion que gustes.\n\n', [{ body: 'Control de Asistencia', id: 'controlAsistencia' }, { body: "Evaluación 360", id: 'evaluacion360' }, { body: "Quejas o Sugerencias", id: 'quejasSugerencias' }, { body: "Salir", id: 'salir' }], '!HOLA¡ TE DAMOS LA BIENVENIDA AL ASISTENTE VIRTUAL DE ECODELI INDUSTRIAL 🤖*\n', '  ¿En que proceso te puedo ayudar? ');
                        this.sendMessage(from, buttonsss);
                        break;
                }
            }
            else if (this.arrayUsuarios[telefono[0]]["estado"] == "ActivoComercial") {
                switch (body) {
                    case "Quejas o Sugerencias":
                        let botones = new whatsapp_web_js_1.Buttons(' ¿Que deseas registrar?', [{ body: 'Queja' }, { body: 'Sugerencia' }, { body: 'Salir' }], '**QUEJAS Y/O SUGERENCIAS**');
                        this.sendMessage(from, botones);
                        this.arrayUsuarios[telefono[0]]["opcion"] = 'quejas';
                        this.arrayUsuarios[telefono[0]]["estado"] = "enMenuComercial";
                        break;
                    //obtencion de link para contestar evaluacion 360
                    case "Evaluación 360":
                        let botonesEvaluacion = new whatsapp_web_js_1.Buttons(' Evaluacion 360°', [{ body: 'Regresar a menu', id: 'regresar' }, { body: "Salir", id: 'salir' }], "*HOLA! " + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + "*", 'Este es tu enlace personalizado para responder la(s) evaluación(es).\n\n **POR FAVOR NO COMPARTIRLO**\n\n https://www.ecodeli.com/Evaluacion360/listado?telefono=' + telefono[0]);
                        this.sendMessage(from, botonesEvaluacion);
                        break;
                    //salir de interactuar con el bot
                    case "Salir":
                        this.sendMessage(from, "Hasta pronto 👋👋👋👋👋👋");
                        this.arrayUsuarios[telefono[0]] = undefined;
                        break;
                    default:
                        let buttonsss = new whatsapp_web_js_1.Buttons('\nA continuación se muestra el 📋 menu con las opciones disponibles\n\n Puedes seleccionar la opcion que gustes.\n\n', [{ body: "Evaluación 360", id: 'evaluacion360' }, { body: "Quejas o Sugerencias", id: 'quejasSugerencias' }, { body: "Salir", id: 'salir' }], '!HOLA¡ TE DAMOS LA BIENVENIDA AL ASISTENTE VIRTUAL DE ECODELI COMERCIAL 🤖*\n', '  ¿En que proceso te puedo ayudar? ');
                        this.sendMessage(from, buttonsss);
                        break;
                }
            }
            /**
             * Manejo de menus de opciones internos del primer flujo del Bot
            */
            else if (this.arrayUsuarios[telefono[0]]["estado"] == "enMenu") {
                switch (this.arrayUsuarios[telefono[0]]["opcion"]) {
                    case 'controlAsistencia':
                        if (body == 'Entrada') {
                            this.sendMessage(from, "**Perfecto** \n Seleccionaste entrada  \n \n Para continuar envia tu ubicacion actual  \n 📍📍📍📍📍");
                            this.arrayUsuarios[telefono[0]]["entrada"] = true;
                        }
                        else if (body == 'Salida') {
                            this.sendMessage(from, "**Perfecto** \n Seleccionaste salida  \n \n Para continuar envia tu ubicacion actual  \n 📍📍📍📍📍");
                        }
                        else if (msg.location !== undefined) {
                            //console.log('distancia en metros',this.getDistanciaMetros(this.arrayUsuarios[telefono[0]]['data'][0].strLatitud, this.arrayUsuarios[telefono[0]]['data'][0].strLongitud, msg.location.latitude, msg.location.longitude))
                            if (this.getDistanciaMetros(this.arrayUsuarios[telefono[0]]['data'][0].strLatitud, this.arrayUsuarios[telefono[0]]['data'][0].strLongitud, msg.location.latitude, msg.location.longitude) < 1000.0) {
                                if (this.arrayUsuarios[telefono[0]]["entrada"]) {
                                    let dataEntrada = {
                                        strAccion: 'checkIn',
                                        strPersonal: this.arrayUsuarios[telefono[0]]['data'][0].strPersonal
                                    };
                                    axios_1.default.post(this.url, dataEntrada).then((response) => {
                                        if (response.data != '') {
                                            let botones = new whatsapp_web_js_1.Buttons('Asistencia de ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + ' Registrada Correctamente', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅      ASISTENCIA      ✅', 'Control de Asistencia');
                                            this.sendMessage(from, botones);
                                        }
                                    });
                                    this.arrayUsuarios[telefono[0]]["entrada"] = false;
                                    this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                                }
                                else {
                                    let dataSalida = {
                                        strAccion: 'checkOut',
                                        strPersonal: this.arrayUsuarios[telefono[0]]['data'][0].strPersonal
                                    };
                                    axios_1.default.post(this.url, dataSalida).then((response) => {
                                        console.log(response);
                                        if (response) {
                                            let botones = new whatsapp_web_js_1.Buttons('Salida de : ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + ' Registrada Correctamente', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅      SALIDA      ✅', 'Control de Asistencia');
                                            this.sendMessage(from, botones);
                                        }
                                    });
                                    this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                                }
                            }
                            else {
                                let media = whatsapp_web_js_1.MessageMedia.fromFilePath(`${__dirname}/../../assets/fuera_rango.png`);
                                this.sendMessage(from, media);
                                this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                            }
                        }
                        else if (body == 'Regresar') {
                            let botones = new whatsapp_web_js_1.Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], 'Elegiste la ocion de regresar');
                            this.sendMessage(from, botones);
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                        }
                        else {
                            this.sendMessage(from, "*Opcion no valida para control de asistencia*");
                        }
                        break;
                    case 'quejas':
                        if (body == 'Queja') {
                            this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la queja a continuación:");
                            this.arrayUsuarios[telefono[0]]["queja"] = true;
                        }
                        else if (body == 'Sugerencia') {
                            this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la sugerencia a continuación:");
                            this.arrayUsuarios[telefono[0]]["sugerencia"] = true;
                        }
                        else if (body == 'Salir') {
                            let botones = new whatsapp_web_js_1.Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], '*Elegiste la opción de regresar*');
                            this.sendMessage(from, botones);
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                        }
                        else if (this.arrayUsuarios[telefono[0]]["queja"]) {
                            let botones = new whatsapp_web_js_1.Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], '**Queja Registrada con exito**');
                            this.sendMessage(from, botones);
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                            this.arrayUsuarios[telefono[0]]["queja"] = false;
                        }
                        else if (this.arrayUsuarios[telefono[0]]["sugerencia"]) {
                            let botones = new whatsapp_web_js_1.Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], "**Sugerencia Registrada con exito**");
                            this.sendMessage(from, botones);
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                            this.arrayUsuarios[telefono[0]]["sugerencia"];
                        }
                        else {
                            this.sendMessage(from, "*Opcion no valida para Quejas y/o Sugerencias*");
                        }
                        break;
                }
            }
            /**
             * Manejo de menus de opciones internos del primer flujo del Bot para comercial
            */
            else if (this.arrayUsuarios[telefono[0]]["estado"] == "enMenuComercial") {
                switch (this.arrayUsuarios[telefono[0]]["opcion"]) {
                    case 'quejas':
                        if (body == 'Queja') {
                            this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la queja a continuación:");
                            this.arrayUsuarios[telefono[0]]["queja"] = true;
                        }
                        else if (body == 'Sugerencia') {
                            this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la sugerencia a continuación:");
                            this.arrayUsuarios[telefono[0]]["sugerencia"] = true;
                        }
                        else if (body == 'Salir') {
                            let botones = new whatsapp_web_js_1.Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], '*Elegiste la opción de regresar*');
                            this.sendMessage(from, botones);
                            this.arrayUsuarios[telefono[0]]["estado"] = "ActivoComercial";
                        }
                        else if (this.arrayUsuarios[telefono[0]]["queja"]) {
                            let botones = new whatsapp_web_js_1.Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], '**Queja Registrada con exito**');
                            this.sendMessage(from, botones);
                            this.arrayUsuarios[telefono[0]]["estado"] = "ActivoComercial";
                            this.arrayUsuarios[telefono[0]]["queja"] = false;
                        }
                        else if (this.arrayUsuarios[telefono[0]]["sugerencia"]) {
                            let botones = new whatsapp_web_js_1.Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], "**Sugerencia Registrada con exito**");
                            this.sendMessage(from, botones);
                            this.arrayUsuarios[telefono[0]]["estado"] = "ActivoComercial";
                            this.arrayUsuarios[telefono[0]]["sugerencia"];
                        }
                        else {
                            this.sendMessage(from, "*Opcion no valida para Quejas y/o Sugerencias*");
                        }
                        break;
                }
            }
        }));
        console.log("Iniciando....");
        this.initialize();
        this.on("ready", () => {
            this.status = true;
            this.EM();
            console.log("LOGIN_SUCCESS");
        });
        this.on("auth_failure", () => {
            this.status = false;
            console.log("LOGIN_FAIL");
        });
        this.on("qr", (qr) => {
            console.log('Escanea el codigo QR que esta en la carepta tmp');
            this.generateImage(qr);
        });
    }
    /**
     *
     * @param lat1 coordenada de centro de costos
     * @param lon1 coordenada de ubicacion del usuario
     * @param lat2 coordenada de centro de costos
     * @param lon2 coordenada de ubicacion del usuario
     * @returns distancia en metros entre las coordenadas del centro de costos y la ubicacion actual del usuario
     */
    getDistanciaMetros(lat1, lon1, lat2, lon2) {
        let rad = function (x) { return x * Math.PI / 180; };
        var R = 6378.137; //Radio de la tierra en km 
        var dLat = rad(lat2 - lat1);
        var dLong = rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) *
            Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        //aquí obtienes la distancia en metros por la conversion 1Km =1000m
        var d = R * c * 1000;
        return d;
    }
    /**
     * Enviar mensaje de WS
     * @param mensaje a enviar y telefono del usuario
     * @returns
     */
    sendMsg(lead) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.status)
                    return Promise.resolve({ error: "WAIT_LOGIN" });
                const { message, phone } = lead;
                this.arrayTelefonos = phone;
                this.arrayTelefonos.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                    this.sendMessage(`${element}@c.us`, "*Evaluacion 360°*\n *¡HOLA !* \n \n Para nosotros es importante que respondas esta breve encuesta.\n  Te compartimos este enlace donde podrás acceder, es único y exclusivo para cada persona,\n\n **POR FAVOR NO COMPARTIRLO**.");
                    this.sendMessage(`${element}@c.us`, "https://www.ecodeli.com/Evaluacion360/listado?telefono=" + element);
                    console.log('se envio');
                }));
                this.arrayTelefonos = [];
            }
            catch (e) {
                return Promise.resolve({ error: e.message });
            }
        });
    }
    getStatus() {
        return this.status;
    }
}
exports.default = WsTransporter;
