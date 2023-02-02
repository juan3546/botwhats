import { Client, LocalAuth, MessageMedia, Buttons, List } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";
import axios from 'axios';
import process from 'process';
import { response } from "express";

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  //rutas de consulta a apis 
  public url = 'http://www.limpiezamexico.mx/ApiRest/APIPaginaIndustrial/v1/paginaIndustrial/sp_WhatsAppBot'; //url de api para consultar informacion del usuario INDUSTRIAL
  public urlComercial = 'https://www.cleanclean.mx/ApiRest/APIModuloRH/v1/ModuloRH/sp_WhatsAppBot'; //url de api para consultar informacion del usuario COMERCIAL

  private status = false;

  arrayTelefonos: any = [] //array donde se alamcen los telefonos 
  arrayUsuarios: any = {}; // Array que contiene todos los usuarios que enteractuan con el bot y la api 
  arrayCentroCostos: any = [] //Array que contiene los centros de costos de apoyo para registrar entrada y salida

  private EM: any; //Metodo encargado de escuchar todos los mensajes que recibe el bot

  constructor() {
    super({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true }
    });


    /**
    * Metodo que escucha todos los mensajes que le llegan al telefono servidor
    */
    this.EM = () => this.on('message', async msg => {
      const { from, body, hasMedia, type, isForwarded } = msg; // variable sostenidas del mensaje entrante
      const telefono = from.split('@')
      /**
       * Empieza la validacion del flujo princiapal del bot
      */

      if (this.arrayUsuarios[telefono[0]] === undefined) { //si el usuario no ha enviado mensajes entra aqui

        let data = {
          "strAccion": "checkingInfo",
          "strTelefono": telefono[0]
        }

        axios.post(this.url, data)
          .then(async (response: any) => {
            console.log(response.data)
            if (response.data != '') {
              //se construe el usuario en el arreglo
              this.arrayUsuarios[telefono[0]] = { "estado": 'Activo', "menu": '', "opcion": '', "entrada": false, "data": response.data, "dataGeo": '', "queja": false, "sugerencia": false };
              let buttons = new Buttons('A continuación se muestra el 📋 menu con las opciones disponibles\n\n Puedes seleccionar la opcion que gustes.\n', [{ body: 'Control de Asistencia', id: 'controlAsistencia' }, { body: "Evaluación 360", id: 'evaluacion360' }, { body: "Quejas o Sugerencias", id: 'quejasSugerencias' }, { body: "Salir", id: 'salir' }], '!HOLA¡ TE DAMOS LA BIENVENIDA AL ASISTENTE VIRTUAL DE ECODELI  INDUSTRIAL 🤖*\n', '  ¿En que proceso te puedo ayudar? ')
              this.sendMessage(from, buttons);
            } else {
              let dataComercial = {
                "strAccion": "checkingInfo",
                "strTelefono": telefono[0]
              }
              axios.post(this.urlComercial, dataComercial).then(async (response: any) => {

                if (response.data != '') {

                  this.arrayUsuarios[telefono[0]] = { "estado": 'ActivoComercial', "menu": '', "opcion": '', "entrada": false, "data": response.data, "queja": false, "sugerencia": false };
                  let buttonsComercial = new Buttons('A continuación se muestra el 📋 menu con las opciones disponibles\n\n Puedes seleccionar la opcion que gustes.\n', [{ body: "Evaluación 360", id: 'evaluacion360' }, { body: "Quejas o Sugerencias", id: 'quejasSugerencias' }, { body: "Salir", id: 'salir' }], '!HOLA¡ TE DAMOS LA BIENVENIDA AL ASISTENTE VIRTUAL DE ECODELI COMERCIAL🤖*\n', '  ¿En que proceso te puedo ayudar? ')
                  this.sendMessage(from, buttonsComercial)

                } else {
                  let media = MessageMedia.fromFilePath(`${__dirname}/../../assets/error2.png`);
                  this.sendMessage(from, media)
                }
              })
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      //Si el usuario ya interactuo por lo menos una vez entra qui
      else if (this.arrayUsuarios[telefono[0]]["estado"] == "Activo") {
        switch (body) {
          //Apartado para que se registre entradas y salidas de los empleados
          case "Control de Asistencia":

            let buttons = new Buttons('   ¿Que deseas registrar?', [{ body: 'Entrada' }, { body: 'Salida' }, { body: 'Regresar' }], "*HOLA! " + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + "* \n Elegiste control de asistencia*")
            this.sendMessage(from, buttons)
            this.arrayUsuarios[telefono[0]]["opcion"] = 'controlAsistencia'
            this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";

            break;
          //Apartado para el registro de quejas y sugerencias
          case "Quejas o Sugerencias":

            let botones = new Buttons(' ¿Que deseas registrar?', [{ body: 'Queja' }, { body: 'Sugerencia' }, { body: 'Salir' }], '**QUEJAS Y/O SUGERENCIAS**')
            this.sendMessage(from, botones)
            this.arrayUsuarios[telefono[0]]["opcion"] = 'quejas'
            this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";

            break;
          //obtencion de link para contestar evaluacion 360
          case "Evaluación 360":

            let botonesEvaluacion = new Buttons(' Evaluacion 360°', [{ body: 'Regresar a menu', id: 'regresar' }, { body: "Salir", id: 'salir' }], "*HOLA! " + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + "*", 'Este es tu enlace personalizado para responder la(s) evaluación(es).\n\n **POR FAVOR NO COMPARTIRLO**\n\n https://ecodeli-industrial.com/Evaluacion360/listado/' + telefono[0])
            this.sendMessage(from, botonesEvaluacion)

            break;
          //salir de interactuar con el bot
          case "Salir":

            this.sendMessage(from, "Hasta pronto 👋👋👋👋👋👋")
            this.arrayUsuarios[telefono[0]] = undefined

            break;
          default:
            let buttonsss = new Buttons('\nA continuación se muestra el 📋 menu con las opciones disponibles\n\n Puedes seleccionar la opcion que gustes.\n\n', [{ body: 'Control de Asistencia', id: 'controlAsistencia' }, { body: "Evaluación 360", id: 'evaluacion360' }, { body: "Quejas o Sugerencias", id: 'quejasSugerencias' }, { body: "Salir", id: 'salir' }], '!HOLA¡ TE DAMOS LA BIENVENIDA AL ASISTENTE VIRTUAL DE ECODELI INDUSTRIAL 🤖*\n', '  ¿En que proceso te puedo ayudar? ')
            this.sendMessage(from, buttonsss);
            break;
        }
      }
      else if (this.arrayUsuarios[telefono[0]]["estado"] == "ActivoComercial") {
        switch (body) {
          case "Quejas o Sugerencias":
            let botones = new Buttons(' ¿Que deseas registrar?', [{ body: 'Queja' }, { body: 'Sugerencia' }, { body: 'Salir' }], '**QUEJAS Y/O SUGERENCIAS**')
            this.sendMessage(from, botones)
            this.arrayUsuarios[telefono[0]]["opcion"] = 'quejas';
            this.arrayUsuarios[telefono[0]]["estado"] = "enMenuComercial";
            break;
          //obtencion de link para contestar evaluacion 360
          case "Evaluación 360":
            let botonesEvaluacion = new Buttons(' Evaluacion 360°', [{ body: 'Regresar a menu', id: 'regresar' }, { body: "Salir", id: 'salir' }], "*HOLA! " + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + "*", 'Este es tu enlace personalizado para responder la(s) evaluación(es).\n\n **POR FAVOR NO COMPARTIRLO**\n\n https://www.ecodeli.com/Evaluacion360/listado?telefono=' + telefono[0])
            this.sendMessage(from, botonesEvaluacion)
            break;
          //salir de interactuar con el bot
          case "Salir":
            this.sendMessage(from, "Hasta pronto 👋👋👋👋👋👋")
            this.arrayUsuarios[telefono[0]] = undefined
            break;
          default:
            let buttonsss = new Buttons('\nA continuación se muestra el 📋 menu con las opciones disponibles\n\n Puedes seleccionar la opcion que gustes.\n\n', [{ body: "Evaluación 360", id: 'evaluacion360' }, { body: "Quejas o Sugerencias", id: 'quejasSugerencias' }, { body: "Salir", id: 'salir' }], '!HOLA¡ TE DAMOS LA BIENVENIDA AL ASISTENTE VIRTUAL DE ECODELI COMERCIAL 🤖*\n', '  ¿En que proceso te puedo ayudar? ')
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
              this.arrayUsuarios[telefono[0]]["entrada"] = true

            } else if (body == 'Salida') {
              this.sendMessage(from, "**Perfecto** \n Seleccionaste salida  \n \n Para continuar envia tu ubicacion actual  \n 📍📍📍📍📍");

            } else if (msg.location !== undefined) {

              // console.log('distancia en metros',this.getDistanciaMetros(this.arrayUsuarios[telefono[0]]['data'][0].strLatitud, this.arrayUsuarios[telefono[0]]['data'][0].strLongitud, msg.location.latitude, msg.location.longitude), this.arrayUsuarios[telefono[0]]['data'][0].strTelefono)
              if (this.getDistanciaMetros(this.arrayUsuarios[telefono[0]]['data'][0].strLatitud, this.arrayUsuarios[telefono[0]]['data'][0].strLongitud, msg.location.latitude, msg.location.longitude) < 1000.0) {

                if (this.arrayUsuarios[telefono[0]]["entrada"]) {

                  let dataEntrada = {
                    strAccion: 'checkIn',
                    strPersonal: this.arrayUsuarios[telefono[0]]['data'][0].strPersonal,
                    strCentroCostos: this.arrayUsuarios[telefono[0]]['data'][0].strCentroCostos
                  }
                 
                  axios.post(this.url, dataEntrada).then((response: any) => {

                    if (response.data != '') {
                      let botones = new Buttons('ASISTENCIA DE: ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + '\n REGISTRADA CORRECTAMENTE', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅ ✅      ASISTENCIA      ✅ ✅', 'Control de Asistencia')
                      this.sendMessage(from, botones)
                    }
                  })
                  this.arrayUsuarios[telefono[0]]["entrada"] = false
                  this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                } else {

                  let dataSalida = {
                    strAccion: 'checkOut',
                    strPersonal: this.arrayUsuarios[telefono[0]]['data'][0].strPersonal,
                    strCentroCostos: this.arrayUsuarios[telefono[0]]['data'][0].strCentroCostos
                  }

                  axios.post(this.url, dataSalida).then((response: any) => {
                       console.log(response.data)

                    if (response) {
                      let botones = new Buttons('SALIDA DE : ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + '\n REGISTRADA CORRECTAMENTE', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅      SALIDA      ✅', 'Control de Asistencia')
                      this.sendMessage(from, botones)
                    }
                  })
                  this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                }
              } else {
                if ((this.arrayUsuarios[telefono[0]]['data'][0].strLatitud != '' && this.arrayUsuarios[telefono[0]]['data'][0].strLongitud != '') || (this.arrayUsuarios[telefono[0]]['data'][0].strLatitud != 0 && this.arrayUsuarios[telefono[0]]['data'][0].strLongitud != 0)) {

                  let dataGeolocalizaciones = {
                    strAccion: 'BuscarGeolocalizacion',
                    strTelefono: telefono[0]
                  }
                  axios.post(this.url, dataGeolocalizaciones).then((response: any) => {
                    console.log(response.data)
                   // this.arrayUsuarios[telefono[0]]['dataGeo'] = response.data

                   this.arrayUsuarios[telefono[0]]['dataGeo'] = response.data.filter((b: any) => {
                      return (this.getDistanciaMetros(b.strLatitud, b.strLongitud, msg.location.latitude, msg.location.longitude) < b.intArea);
                    });
                    console.log(this.arrayUsuarios[telefono[0]]['dataGeo'] )

                    if (this.arrayUsuarios[telefono[0]]['dataGeo']) {

                      if (this.arrayUsuarios[telefono[0]]['dataGeo'] == 1) {
                        //if para revisar la distancia de los centros de costos seleccionados desde la lista
                        if (this.getDistanciaMetros(this.arrayUsuarios[telefono[0]]['dataGeo'][0].strLatitud, this.arrayUsuarios[telefono[0]]['dataGeo'][0].strLongitud, msg.location.latitude, msg.location.longitude) < this.arrayUsuarios[telefono[0]]['dataGeo'][0].intArea) {
                          if (this.arrayUsuarios[telefono[0]]["entrada"]) {

                            let dataEntrada = {
                              strAccion: 'checkIn',
                              strPersonal: this.arrayUsuarios[telefono[0]]['data'][0].strPersonal,
                              strCentroCostos: this.arrayUsuarios[telefono[0]]['dataGeo'].strCentroCostos
                            }

                            axios.post(this.url, dataEntrada).then((response: any) => {

                              if (response.data != '') {
                                let botones = new Buttons('ASISTENCIA DE: ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + '\n REGISTRADA CORRECTAMENTE', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅ ✅      ASISTENCIA      ✅ ✅', 'Control de Asistencia')
                                this.sendMessage(from, botones)
                              }
                            })
                            this.arrayUsuarios[telefono[0]]["entrada"] = false
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                          } else {
                            let dataSalida = {
                              strAccion: 'checkOut',
                              strPersonal: this.arrayUsuarios[telefono[0]]['data'][0].strPersonal,
                              strCentroCostos: this.arrayCentroCostos[telefono[0]].strCentroCostos
                            }

                            axios.post(this.url, dataSalida).then((response: any) => {

                              if (response) {
                                let botones = new Buttons('SALIDA DE : ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + '\n REGISTRADA CORRECTAMENTE', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅      SALIDA      ✅', 'Control de Asistencia')
                                this.sendMessage(from, botones)
                              }
                            })
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                          }
                        } else {
                          let media = MessageMedia.fromFilePath(`${__dirname}/../../assets/fuera_rango.png`);
                          this.sendMessage(from, media)
                          this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                        }
                      } else if (this.arrayUsuarios[telefono[0]]['dataGeo'].length > 1) {
                        let arregloAUx: any = []
                        this.arrayUsuarios[telefono[0]]['dataGeo'].forEach((element: any) => {
                          let datos = { id: element.strCentroCostos, title: element.strCentroCostos }
                          arregloAUx.push(datos)
                        });
                        const listaCentroCostos = new List(
                          "Selecciona Centro de Costos",
                          "VER MAS",
                          [
                            {
                              title: "Selecciona el centro de costos en que te ubicas",
                              rows: arregloAUx,
                            },
                          ],
                          "CENTRO DE COSTOS CERCANOS"
                        );
                        this.sendMessage(from, listaCentroCostos);
                      }else if(this.arrayUsuarios[telefono[0]]['dataGeo'].length == 0){
                        let media = MessageMedia.fromFilePath(`${__dirname}/../../assets/fuera_rango.png`);
                      this.sendMessage(from, media)
                      this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                      }
                    }else{
                      let media = MessageMedia.fromFilePath(`${__dirname}/../../assets/fuera_rango.png`);
                      this.sendMessage(from, media)
                      this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                    }
                  })
                } else {
                  let media = MessageMedia.fromFilePath(`${__dirname}/../../assets/coordenadasincorrectas.jpeg`);
                  this.sendMessage(from, media)
                  //this.sendMessage(from, 'Coordenadas de centro de costos incorrectas')
                  this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                }
              }
            } else if (body == 'Regresar') {

              let botones = new Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], 'Elegiste la ocion de regresar')
              this.sendMessage(from, botones)
              this.arrayUsuarios[telefono[0]]["estado"] = "Activo"

            }else if(body == 'Salir'){
              this.sendMessage(from, "Hasta pronto 👋👋👋👋👋👋")
              this.arrayUsuarios[telefono[0]] = undefined

            } else if (type === 'list_response') {
             
              if (this.arrayUsuarios[telefono[0]]["entrada"]) {

                let dataEntradaGeo = {
                  strAccion: 'checkIn',
                  strPersonal: this.arrayUsuarios[telefono[0]]['data'][0].strPersonal,
                  strCentroCostos: body
                }

                axios.post(this.url, dataEntradaGeo).then((response: any) => {

                  if (response.data != '') {
                    let botones = new Buttons('ASISTENCIA DE: ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + '\n REGISTRADA CORRECTAMENTE', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅ ✅      ASISTENCIA      ✅ ✅', 'Control de Asistencia')
                    this.sendMessage(from, botones)
                  }
                })
                this.arrayUsuarios[telefono[0]]["entrada"] = false
                this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              } else {
                let dataSalidaGeo = {
                  strAccion: 'checkOut',
                  strPersonal: this.arrayUsuarios[telefono[0]]['data'][0].strPersonal,
                  strCentroCostos: body
                }

                axios.post(this.url, dataSalidaGeo).then((response: any) => {

                  if (response) {
                    let botones = new Buttons('SALIDA DE : ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + '\n REGISTRADA CORRECTAMENTE', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅      SALIDA      ✅', 'Control de Asistencia')
                    this.sendMessage(from, botones)
                  }
                })
                this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              }
              this.arrayUsuarios[telefono[0]]['dataGeo'] = ''
            }
            else {
              let botones = new Buttons('Da click en el boton para iniciar proceso nuevamente', [{ body: 'Regresar' }, { body: 'Salir' }],'*Opcion no valida para control de asistencia*')
              this.sendMessage(from, botones)
            }
            break;

          case 'quejas':
            if (body == 'Queja') {
              this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la queja a continuación:");
              this.arrayUsuarios[telefono[0]]["queja"] = true

            } else if (body == 'Sugerencia') {

              this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la sugerencia a continuación:");
              this.arrayUsuarios[telefono[0]]["sugerencia"] = true

            } else if (body == 'Salir') {

              let botones = new Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], '*Elegiste la opción de regresar*')
              this.sendMessage(from, botones)
              this.arrayUsuarios[telefono[0]]["estado"] = "Activo"

            } else if (this.arrayUsuarios[telefono[0]]["queja"]) {
              let botones = new Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], '**Queja Registrada con exito**')
              this.sendMessage(from, botones)
              this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              this.arrayUsuarios[telefono[0]]["queja"] = false

            } else if (this.arrayUsuarios[telefono[0]]["sugerencia"]) {
              let botones = new Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], "**Sugerencia Registrada con exito**")
              this.sendMessage(from, botones)
              this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              this.arrayUsuarios[telefono[0]]["sugerencia"]
            } else {
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
              this.arrayUsuarios[telefono[0]]["queja"] = true

            } else if (body == 'Sugerencia') {

              this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la sugerencia a continuación:");
              this.arrayUsuarios[telefono[0]]["sugerencia"] = true

            } else if (body == 'Salir') {

              let botones = new Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], '*Elegiste la opción de regresar*')
              this.sendMessage(from, botones)
              this.arrayUsuarios[telefono[0]]["estado"] = "ActivoComercial"

            } else if (this.arrayUsuarios[telefono[0]]["queja"]) {
              let botones = new Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], '**Queja Registrada con exito**')
              this.sendMessage(from, botones)
              this.arrayUsuarios[telefono[0]]["estado"] = "ActivoComercial"
              this.arrayUsuarios[telefono[0]]["queja"] = false

            } else if (this.arrayUsuarios[telefono[0]]["sugerencia"]) {
              let botones = new Buttons(' ', [{ body: 'Menu Principal' }, { body: 'Salir' }], "**Sugerencia Registrada con exito**")
              this.sendMessage(from, botones)
              this.arrayUsuarios[telefono[0]]["estado"] = "ActivoComercial"
              this.arrayUsuarios[telefono[0]]["sugerencia"]
            } else {
              this.sendMessage(from, "*Opcion no valida para Quejas y/o Sugerencias*");
            }
            break;
        }
      }
    });

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
      console.log('Escanea el codigo QR que esta en la carepta tmp')
      this.generateImage(qr)
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
  public getDistanciaMetros(lat1: any, lon1: any, lat2: any, lon2: any) {
    let rad = function (x: any) { return x * Math.PI / 180; }
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
  async sendMsg(lead: { message: string; phone: any }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
      const { message, phone } = lead;
      this.arrayTelefonos = phone

      this.arrayTelefonos.forEach(async (element: any) => {

        this.sendMessage(`${element}@c.us`, "*Evaluacion 360°*\n *¡HOLA !* \n \n Para nosotros es importante que respondas esta breve encuesta.\n  Te compartimos este enlace donde podrás acceder, es único y exclusivo para cada persona,\n\n **POR FAVOR NO COMPARTIRLO**.")
        this.sendMessage(`${element}@c.us`, "https://www.ecodeli.com/Evaluacion360/listado?telefono=" + element)
        //console.log('se envio')
      })
      this.arrayTelefonos = []

    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }
  getStatus(): boolean {
    return this.status;
  }
  /**
   * 
   * @param base64 Metodo que genera el codigo qr que lee el telefono donde se van a responder todos los mensajes
   */
  private generateImage = (base64: string) => {
    const path = `${process.cwd()}/tmp`;
    let qr_svg = imageQr(base64, { type: "svg", margin: 4 });
    qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
  };
}
export default WsTransporter;