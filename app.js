const Alarm = require("./Alarm");
var config = require("./config.json");

var alarm = new Alarm(config.username, config.password, config.code);

const express = require("express");
const app = express();
const port = 3010;

app.get("/state", (request, response) => {
  if (alarm.installation == null) response.send("Failed with init!");
  else {
    alarm.getCurrentAlarmState(function (data) {
      response.send(data);
    });
  }
});

app.get("/overview", (request, response) => {
  if (alarm.installation == null) response.send("Failed with init!");
  else {
    alarm.getCurrentInstallation(function (data) {
      response.json(data);
    });
  }
});

app.get("/", (request, response) => {
  if (alarm.installation == null) response.send("Failed with init!");
  else {
    response.send("Versiure State API started");
  }
});

app.get("/state/arm", (request, response) => {
  if (alarm.installation == null) response.send("Failed with init!");
  else {
    alarm.setTargetAlarmState("ARMED_AWAY", function (data) {
      response.send("ARMED_AWAY");
    });
  }
});

app.get("/state/disarm", (request, response) => {
  if (alarm.installation == null) response.send("Failed with init!");
  else {
    alarm.setTargetAlarmState("DISARMED", function (data) {
      response.send("DISARMED");
    });
  }
});

app.get("/state/home", (request, response) => {
  if (alarm.installation == null) response.send("Failed with init!");
  else {
    alarm.setTargetAlarmState("ARMED_HOME", function (data) {
      response.send("ARMED_HOME");
    });
  }
});

app.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err);
  }
  alarm.init();
  console.log(`server is listening on ${port}`);
});

app.set("json spaces", 40);
