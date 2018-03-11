const express = require('express');
const bodyParser = require('body-parser');
const ttn_interface = require("./ttn_interface");

const STATUS_DEFAULT = 0;
const BSTATS_DEFAULT = false;
const THRESH_DEFAULT = 5;
const OPERAT_DEFAULT = true;

let data = {
  temp  : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
  gas   : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
  alert : {status : BSTATS_DEFAULT, operational : OPERAT_DEFAULT},
  water : {status : BSTATS_DEFAULT, operational : OPERAT_DEFAULT}
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

let app = express();
const PORT = process.env.PORT || 80;

app.use('/', express.static('public'));

app.use(bodyParser.json());

app.post("/thr/gas",(req, res) => { //Set the new threshold for gas
  ttn_interface.send_message("gas", req.body.set);
  res.status(200).send();
});

app.post("/thr/temp", (req, res) => { //Set the new threshold for temperatures
  ttn_interface.send_message("temperature", req.body.set);
  res.status(200).send();
});

app.post("/set/alrt", (req, res) => { //Set the on or off state of the buzzer alarm
  ttn_interface.send_message("alert", req.body.set);
  res.status(200).send();
});

app.post("/set/wtr",(req, res) => { //Set the on or off state of the water pump
  ttn_interface.send_message("water", req.body.set);
  res.status(200).send();
});

app.get("/status", (req, res) => { //Get the most updated status of temperature, gas, alarm and pump
    res.send(ttn_interface.get_status());
});

app.listen(PORT, () => {
  console.log("Started on port " + PORT);
});

ttn_interface.initialize();

module.exports = {app};
