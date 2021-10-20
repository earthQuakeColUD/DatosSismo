"use strict"

const { base } = require("../modelosDatos/datosSismos");

const axios = require("axios"),
    xmlToJson = require("xml-to-json-stream"),
    xmltojson = xmlToJson({ attributeMode: false }),
    basedDatos = require("../conecciones/baseDatos");


async function stateEartquakeDB() {
    var reponseDB = await basedDatos.Earthquake();
    if (reponseDB.length < 1) {
        var todosSismos = await callearthquakeUSGS();
        var sismosColombianos = await sismosColombia(todosSismos);
        var sismosColombianosOrganizados = await organizarSismosFecha(sismosColombianos)
        guardarSismos(sismosColombianosOrganizados)
    }
}

async function getListLastearthquakeDB() {
    var sismosColombianosOrganizados = await basedDatos.allEarthquake();
    return ({ respuesta: sismosColombianosOrganizados });
}

function guardarSismos(sismosColombianos) {
    for (var i = (sismosColombianos.length - 1); i >= 0; i--) {
        basedDatos.saveDB(sismosColombianos[i])
    }
}

async function callearthquakeUSGS() {
    try {
        var peticion = {
            method: 'get',
            url: "https://earthquake.usgs.gov/fdsnws/event/1/query",
            params: {
                format: "xml",
                minlatitude: 1.116640,
                minlongitude: -79.102483,
                maxlatitude: 7.811735,
                maxlongitude: -69.940997
            }
        }
        var { data } = await axios(peticion);
        var result = xmltojson.xmlToJson(data, (err, json) => {
            if (err) {
                console.log("error xml o json USGS")
                console.log(err)
            }
            else {
                return json["q:quakeml"]["eventParameters"];
            }
        })
        return result;
    }
    catch (e) {
        console.log("error callearthquakeUSGS: " + e)
        return ("error callearthquakeUSGS")
    }
}

function sismosColombia(sismos) {
    var respuesta = new Array;
    for (var eventos of sismos.event) {
        if (eventos.description.text.toUpperCase().includes("COLOMBIA")) {
            var JsonFormat = {
                descripcion: eventos.description.text,
                tipoMovimento: "movimientos teluricos",
                fecha: eventos.magnitude.creationInfo.creationTime,
                longitud: eventos.origin.longitude.value,
                latitud: eventos.origin.latitude.value,
                magnitud: eventos.magnitude.mag.value
            }
            respuesta.push(JsonFormat);
        }
    }
    return respuesta
}



async function obtenerUltimoSismoDB() {
    try {
        var ultimoSismo = await basedDatos.lastEarthquake();
        return ({ respuesta: ultimoSismo });
    } catch (e) {
        return ("error" + e)
    }
}


function organizarSismosFecha(sismosColombianos) {
    try {
        var sismos = sismosColombianos.sort(
            function (a, b) {
                a = new Date(a.fecha); b = new Date(b.fecha);
                return a > b ? -1 : a < b ? 1 : 0;
            }
        )
        return sismos;
    }
    catch (e) {
        console.log("error al organizar sismos por fecha" + e);
        return e;
    }
}

async function actualizacion() {
    var todosSismos = await callearthquakeUSGS();
    var usuario = [];
    var sismosColombianos = await sismosColombia(todosSismos);
    var sismosCO = await organizarSismosFecha(sismosColombianos)
    var sismosDB = await basedDatos.lastEarthquake();
    if (sismosDB[0].descripcion != sismosCO[0].descripcion ||
        sismosDB[0].longitud != sismosCO[0].longitud ||
        sismosDB[0].latitud != sismosCO[0].latitud ||
        sismosDB[0].magnitud != sismosCO[0].magnitud
    ) {

        var eliminarDB = await basedDatos.deleteEarthquake();
        if (eliminarDB.deletedCount > 0) {
            guardarSismos(sismosCO)
        }
        try {

            var peticionUsuarios = {
                method: 'get',
                url: "http://localhost:9999/allUser"
            }
            var { data } = await axios(peticionUsuarios);
            if (data.usuarios.length > 0) {
                for (var info of data.usuarios) {
                    usuario.push(`${info.token}`);
                }
                var peticionNotificacion = {
                    method: 'post',
                    url: "https://fcm.googleapis.com/fcm/send",
                    data: {
                        registration_ids: [JSON.parse(JSON.stringify(`${usuario}`))],
                        notification: {
                            title: "AlertaSismoCol - ALERTA",
                            body: `se apresento un sismo en ${sismosCO[0].descripcion.split("of")[1]}, con una magnitud de ${sismosCO[0].magnitud}`,
                            priority: "high",
                            sound: "alert.mp3",
                            icon: "fcm_push_icon",
                            android_channel_id :"fcm_default_channel"
                        },
                        data: {
                            title: "EarthQuaker - ALERTA",
                            body: `se apresento un sismo en ${sismosCO[0].descripcion.split("of")[1]}, con una magnitud de ${sismosCO[0].magnitud}`,
                            descricion: `${sismosCO[0].descripcion.split("of")[1]}`,
                            longitus: `${sismosCO[0].longitud}`,
                            latitud: `${sismosCO[0].latitud}`,
                            magnitud: `${sismosCO[0].magnitud}`
                        }
                    },
                    headers: {
                        Authorization: "key=AAAApXvAQL4:APA91bFuvgP_jQHng1wLKTdFy4CqEtdIOmw_7SSDQKYCg4YXYXnj9n-hTQgmRcCgXeWEbW4gS1IaU26KGoBn0ZMG7RTQLsWRLejDTQZ8pGxw-obfiCVyhIYTmJgdIBKkFkHw1KsgJd1I"
                    }
                }
                var { data } = await axios(peticionNotificacion);
                console.log(data);
            }
        }
        catch (e) {
            console.log("error peticion")
            console.log(e)
        }
    }
}



module.exports = { getListLastearthquakeDB, obtenerUltimoSismoDB, stateEartquakeDB, actualizacion }