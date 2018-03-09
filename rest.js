require("./config.js");

const express = require('express');
const bodyParser = require('body-parser');

const STATUS_DEFAULT = 0;
const THRESH_DEFAULT = 5;
const OPERAT_DEFAULT = 1;

let data = {
  temp  : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
  gas   : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
  alert : {status : STATUS_DEFAULT, operational : OPERAT_DEFAULT},
  water : {status : STATUS_DEFAULT, operational : OPERAT_DEFAULT}
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var app = express();
const PORT = process.env.PORT || 8080;

app.use('/', express.static('public'))

app.use(bodyParser.json());

app.post("/thr/gas",(req, res) => { //Set the new threshold for gas
  data.gas.threshold = req.body.set;
  res.status(200).send();
});

app.post("/thr/temp", (req, res) => { //Set the new threshold for temperatures
  data.temp.threshold = req.body.set;
  res.status(200).send();
});

app.post("/set/alrt", (req, res) => { //Set the on or off state of the buzzer alarm
  data.alert.operational = req.body.set;
  res.status(200).send();
});

app.post("/set/wtr",(req, res) => { //Set the on or off state of the water pump
  data.water.operational = req.body.set;
  res.status(200).send();
});

app.get("/status", (req, res) => { //Get the most updated status of temperature, gas, alarm and pump
  data.temp.status=getRandomInt(2);
  data.gas.status = getRandomInt(2);
  data.alert.status = getRandomInt(2);
  data.water.status = getRandomInt(2);

  res.send(data);
});

app.listen(PORT, () => {
  console.log("Started on port " + PORT);
});

module.exports = {app};
