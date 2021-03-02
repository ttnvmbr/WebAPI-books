let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/books', { useNewUrlParser: true, useUnifiedTopology: true });
console.log("starting: REST API");

//package koppelen voor de webserver
const express = require('express');

// maak beschikbaar via app
const app = express();

const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());

// voeg entry toe voor url /
app.get('/', function (req, res) {
    res.header("Content-Type", "application/json");
    console.log("end point/");
    res.send("{\"message\" : \"Hello world!\"}");
});


let booksRouter = require('../routes/booksRoutes')();
app.use('/api', booksRouter);


// starten web applicatie
app.listen(8000);