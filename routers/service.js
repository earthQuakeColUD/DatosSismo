"use strict"

const express = require("express"),
    app = express(),
    logicConsSismos = require("./logicaConsultarSismos");

app.get("/consultaSismosolombia", (req, res) => {
    
    logicConsSismos.getListLastearthquakeDB()
        .then(response => {
            res.json(JSON.parse(JSON.stringify(response)))
        })
        .catch(error => {
            res.json(JSON.parse(JSON.stringify({ error: error })))
        })
})
app.get("/ultimoSismoColombia", (req, res) => {
    logicConsSismos.obtenerUltimoSismoDB()
        .then(response => {
            res.json(JSON.parse(JSON.stringify(response)))
        })
        .catch(error => {
            res.json(JSON.parse(JSON.stringify({ error: error })))
        })
})


module.exports = app