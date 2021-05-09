'use strict';
// Include it and extract some methods for convenience
const contract = require("truffle-contract");
const CtrWrp = require('./contract.js');
const Storage = require('./storage.js');
const Timer = require('./timer.js');
const fs = require('fs');
const cors = require('cors');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const flags = require('./flags.js');
const forwarded = require('forwarded');

if (flags.ENV_DEV) {
    console.warn("----------------- CAUTION -----------------");
    console.warn("You are running dev. DO NOT use this for production.");
    console.warn("----------------- CAUTION -----------------");
}

const options = {
    key: (flags.ENV_DEV ? fs.readFileSync('./ssl/ssl.key') : fs.readFileSync('./ssl/prod/ssl.pem')),
    cert: (flags.ENV_DEV ? fs.readFileSync('./ssl/ssl.crt') : fs.readFileSync('./ssl/prod/ssl.pem')),
    ca: (flags.ENV_DEV ? fs.readFileSync('./ssl/ssl.crt') : fs.readFileSync('./ssl/prod/ssl.pem')),
    requestCert: false,
    rejectUnauthorized: false
};

const getIP = (req) => {
    return forwarded(req, req.headers).ip;
}

var app = express();
const PORT = 6500;

app.use(helmet());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", (flags.ENV_DEV ? '*' : 'https://canvas.pixelproperty.io'));
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(express.json());

app.get('/getCanvas', (req, res) => {
    res.send(Storage.instance.getImageData());
    res.end();
});
app.get('/getImage.png', (req, res) => {
    if (!Storage.instance.loadingComplete) {
        res.status(190).end();
    } else {
        res.writeHead(200, { 'Content-Type': 'image/png' });
        let img = fs.readFileSync('./cache/image.png');
        res.end(img, 'binary');
    }
});
app.get('/getIP', (req, res) => {
    let ips = forwarded(req);
    ips.forEach((ip, i) => {
        ips[i] = ip.replace(/::.*:/gm, '');
    })
    res.send({ips});
    res.end();
});
app.get('/getPixelData', (req, res) => {
    res.send(Storage.instance.pixelData);
    res.end();
});
app.get('/getPropertyData', (req, res) => {
    res.send(Storage.instance.getPropertyData());
    res.end();
});
app.get('/getEventData', (req, res) => {
    res.send(Storage.instance.getEventData());
    res.end();
});
app.post('/setColors', (req, res) => {
    let x = req.body.x;
    let y = req.body.y;
    let data = req.body.data;

    if (x == null || x < 0 || x > 99) {
        res.send(false);
        res.end();
    }

    if (y == null || y < 0 || y > 99) {
        res.send(false);
        res.end();
    }

    if (data == null || Object.keys(data).length !== 400) {
        res.send(false);
        res.end();
    }

    if (Storage.instance.canSimpleUpdatePropertyImage(x, y)) {
        Storage.instance.insertPropertyImage(x, y, data);
        res.send(true);
        res.end();
    } else {
        res.send(false);
        res.end();
    }
});
var server = https.createServer(options, app).listen(PORT, function() {
    console.log("Running on port: ", PORT);
});

Storage.instance.loadCanvas();