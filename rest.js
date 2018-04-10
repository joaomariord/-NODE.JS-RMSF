const express = require('express');
const bodyParser = require('body-parser');
const ttn_interface = require("./ttn_interface");
const push = require("./android_push_api")

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

app.post('/store', (req, res) => {
  try{
    push.SaveToken(req.body)
    res.status(200).send()
  } catch (error) {
    res.status(400).send()
    console.error(error)
  }
})

//AUTH ROUTES
app.post("/register", (req, res) =>{
    res.status(501).send();
});

app.post("/login", (req, res) =>{
    res.status(501).send();
});

app.post("/logout", (req, res) =>{
    res.status(501).send();
});

//APPLICATION AND DEVICE ROUTES
app.post("/application", (req, res) =>{
    res.status(501).send();
});

app.post("/device", (req, res) =>{
    res.status(501).send();
});

app.delete("/application", (req, res) =>{
    res.status(501).send();
});

app.delete("/device", (req, res) =>{
    res.status(501).send();
});

app.get("/application", (req, res) =>{
    res.status(501).send();
});

app.get("/device", (req, res) =>{
    res.status(501).send();
});


app.listen(PORT, () => {
  console.log("Started on port " + PORT);
});

ttn_interface.initialize();

module.exports = {app};
