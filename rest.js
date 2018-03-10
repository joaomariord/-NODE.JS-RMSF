require("./config.js");

const express = require('express');
const bodyParser = require('body-parser');

const STATUS_DEFAULT = 0;
const BSTATS_DEFAULT = false;
const THRESH_DEFAULT = 5;
const OPERAT_DEFAULT = true;

let data = {
  temp  : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
  gas   : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
  alert : {status : BSTATS_DEFAULT, operational : OPERAT_DEFAULT},
  water : {status : BSTATS_DEFAULT, operational : OPERAT_DEFAULT}
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var app = express();
const PORT = process.env.PORT || 80;

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
  data.temp.status  = getRandomInt(10)+20;
  data.gas.status   = getRandomInt(100)+1000;
  if(data.temp.status > data.temp.threshold || data.gas.status > data.gas.threshold){
    data.alert.status = true;
  }
  if (data.temp.status > data.temp.threshold && data.gas.status > data.gas.threshold){
    data.water.status = true;
  }
  if(data.temp.status <= data.temp.threshold && data.gas.status <= data.gas.threshold){
    data.water.status = false;
    data.alert.status = false;
  }

  res.send(data);
});

app.listen(PORT, () => {
  console.log("Started on port " + PORT);
});

module.exports = {app};
