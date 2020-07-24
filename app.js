const Alarm = require("./Alarm");
var config = require("./config.json");

var alarm = new Alarm(config.username, config.password, config.code);

const express = require("express");
const app = express();
const port = 3010;

app.get("/", (request, response) => {
  if (alarm.installation == null) {
    console.log("/: Init Failed");
    response.status(500);
    response.json(getJsonState("ERROR","Init Failed"));
  } else {
    console.log("/: Fetching");
    console.log("/: Response: Versiure State API started");
    response.status(200);
    response.send("Versiure State API started");
  }
});

app.get("/state", (request, response) => {
  
  console.log("/state: Start "+(new Date()).toISOString());
  if (alarm.installation == null) {
    console.log("/state: Init Failed");
    response.status(500);
    response.json(getJsonState("ERROR","Init Failed"));
  } else {
    console.log("/state: Fetching");
    alarm.getCurrentAlarmState(function (data) {
      console.log("/state: Response: " + data);
      if (data == "DISARMED"){
        response.status(200);
        response.json(getJsonState(data,""));
      } else if (data == "ARMED_AWAY"){
        response.status(200);
        response.json(getJsonState(data,""));
      } else if (data == "ARMED_HOME"){
        response.status(200);
        response.json(getJsonState(data,""));
      } else {
        response.status(500);
        response.json(getJsonState("ERROR",data));
      }
    });
  }
});

app.get("/overview", (request, response) => {
  console.log("/overview: Start "+(new Date()).toISOString());
  if (alarm.installation == null) {
    console.log("/overview: Init Failed");
    response.status(500);
    response.json(getJsonState("ERROR","Init Failed"));
  } else {
    console.log("/overview: Fetching");
    alarm.getCurrentInstallation(function (data) {
      console.log("/overview: Response: " + data);
      response.status(200);
      response.json(data);
    });
  }
});

app.get("/state/arm", (request, response) => {
  if (alarm.installation == null) {
    console.log("/state/arm: Init Failed");
    response.status(500);
    response.json(getJsonState("ERROR","Init Failed"));
  } else {
    console.log("/state/arm: Setting "+(new Date()).toISOString());
    alarm.setTargetAlarmState("ARMED_AWAY", function (data) {
      console.log("/state/arm: Response: Received");
      if (data == "OK") {
        console.log("/state/arm: Response: " + data);
        response.status(200);
        response.json(getJsonState("ARMED_AWAY","New State"));
      }
      else if (data['errorCode'] == 'VAL_00818') {
        console.log("/state/arm: Response: Already Set State");
        response.status(200);
        response.json(getJsonState("ARMED_AWAY","Current State"));
      } else {
        console.log("/state/arm: Response: " + data['errorGroup']+ ' <> ' + data['errorCode'] + ' <> ' + data['errorMessage']);
        response.status(500);
        response.json(getJsonState("ERROR",data['errorMessage']));
      }
    });
  }
});

app.get("/state/disarm", (request, response) => {
  if (alarm.installation == null) {
    console.log("/state/disarm: Init Failed");
    response.status(500);
    response.json(getJsonState("ERROR","Init Failed"));
  } else {
    console.log("/state/disarm: Setting "+(new Date()).toISOString());
    alarm.setTargetAlarmState("DISARMED", function (data) {
      console.log("/state/disarm: Response: Received");
      if (data == "OK") {
        console.log("/state/disarm: Response: " + data);
        response.status(200);
        response.json(getJsonState("DISARMED","New State"));
      }
      else if (data['errorCode'] == 'VAL_00818') {
        console.log("/state/disarm: Response: Already Set State");
        response.status(200);
        response.json(getJsonState("DISARMED","Current State"));
      } else {
        console.log("/state/disarm: Response: " + data['errorGroup']+ ' <> ' + data['errorCode'] + ' <> ' + data['errorMessage']);
        response.status(500);
        response.json(getJsonState("ERROR",data['errorMessage']));
      }
    });
  }
});

app.get("/state/home", (request, response) => {
  if (alarm.installation == null) {
    console.log("/state/home: Init Failed");
    response.status(500);
    response.json(getJsonState("ERROR","Init Failed"));
  } else {
    console.log("/state/home: Setting "+(new Date()).toISOString());
    alarm.setTargetAlarmState("ARMED_HOME", function (data) {
      console.log("/state/home: Response: Received");
      if (data == "OK") {
        console.log("/state/home: Response: " + data);
        response.status(200);
        response.json(getJsonState("ARMED_HOME","New State"));
      }
      else if (data['errorCode'] == 'VAL_00818') {
        console.log("/state/home: Response: Already Set State");
        response.status(200);
        response.json(getJsonState("ARMED_HOME","Current State"));
      } else {
        console.log("/state/home: Response: " + data['errorGroup']+ ' <> ' + data['errorCode'] + ' <> ' + data['errorMessage']);
        response.status(500);
        response.json(getJsonState("ERROR",data['errorMessage']));
      }
    });
  }
});

app.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err);
  }
  alarm.init();
  console.log("server is listening on " + port);
});

app.set("json spaces", 40);


function getJsonState(state, message) {
  json = '{"state":"'+ state +'","message":"'+ message +'"}';
  return JSON.parse(json);
};