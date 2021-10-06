"use strict"

const mongoose = require("mongoose"),
    Schemas = mongoose.Schema;

const SchemaResponse = Schemas({
    descripcion:String,
    tipoMovimento:String,
    fecha:String,
    longitud:String,
    latitud:String,
    magnitud:String,
    fecha:{type:Date, default: new Date().toISOString()}
});

module.exports = mongoose.model("datosSismos", SchemaResponse, "Sismos");
