require("./config.js");

const express = require('express');
const bodyParser = require('body-parser');

var app = express();
const PORT = process.env.PORT || 8080;

app.use('/', express.static('public'))

app.use(bodyParser.json());

app.post("/thr/gas",(req, res) => { //Set the new threshold for gas
  res.send("Post received on thr/gas")
});

app.post("/thr/temp", (req, res) => { //Set the new threshold for temperatures
  res.send("Post received on thr/temp")
});

app.post("/alert", (req, res) => { //Set the on or off state of the buzzer alarm
  res.send("Post received on alert")
});

app.get("/status", (req, res) => { //Get the most updated status of temperature, gas, alarm and pump
  res.send("Get received on status")
});

app.listen(PORT, () => {
  console.log("Started on port " + PORT);
});

module.exports = {app};
