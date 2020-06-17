const Alarm = require("./Alarm");
var config = require('./config.json');

var alarm = new Alarm(config.username, config.password, config.code);

const express = require("express");
const app = express();
const port = 3000;

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

app.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err);
  }
  alarm.init();
  console.log(`server is listening on ${port}`);
});

app.set('json spaces', 40);