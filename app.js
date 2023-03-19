const Alarm = require("./Alarm");
const Lock = require("./Lock");
var config = require("./config.json");

var alarm = new Alarm(config.username, config.password, config.code, config.lockserial);
var lock;

const express = require("express");
const app = express();
const port = 3010;

app.get("/", (request, response) => {
  if (alarm.installation == null) {
    console.log("/: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/: Fetching");
    console.log("/: Response: Versiure State API started");
    response.status(200);
    response.send("Versiure State API started");
  }
});

app.get("/state", (request, response) => {
  console.log("/state: Start " + new Date().toISOString());
  if (alarm.installation == null) {
    console.log("/state: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/state: Fetching");
    alarm.getCurrentAlarmState(function (data) {
      console.log("/state: Response: " + JSON.stringify(data));
      if (data == "DISARMED") {
        response.status(200);
        response.json(getJsonState(data, ""));
      } else if (data == "ARMED_AWAY") {
        response.status(200);
        response.json(getJsonState(data, ""));
      } else if (data == "ARMED_HOME") {
        response.status(200);
        response.json(getJsonState(data, ""));
      } else {
        response.status(500);
        response.json(getJsonState("ERROR", data["errorMessage"]));
      }
    });
  }
});

app.get("/overview", (request, response) => {
  console.log("/overview: Start " + new Date().toISOString());
  if (alarm.installation == null) {
    console.log("/overview: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/overview: Fetching");
    alarm.getCurrentInstallation(function (data) {
      console.log("/overview: Response: " + JSON.stringify(data));
      response.status(200);
      response.json(data);
    });
  }
});

app.get("/state/arm", (request, response) => {
  if (alarm.installation == null) {
    console.log("/state/arm: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/state/arm: Setting " + new Date().toISOString());
    alarm.setTargetAlarmState("ARMED_AWAY", function (data) {
      console.log("/state/arm: Response: Received");

      console.log(data)
      response.status(200);
      response.json(getJsonState("ARMED_AWAY", "New State"));
    });
  }
});

app.get("/state/disarm", (request, response) => {
  if (alarm.installation == null) {
    console.log("/state/disarm: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/state/disarm: Setting " + new Date().toISOString());
    alarm.setTargetAlarmState("DISARMED", function (data) {
      console.log("/state/disarm: Response: Received");
      response.status(200);
      response.json(getJsonState("DISARMED", data.armStateDisarm ? "New State" : "Current State"));
    });

  }
});

app.get("/state/home", (request, response) => {
  if (alarm.installation == null) {
    console.log("/state/home: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/state/home: Setting " + new Date().toISOString());
    alarm.setTargetAlarmState("ARMED_HOME", function (data) {
      console.log("/state/home: Response: Received");
      console.log(data)
      response.status(200);
      response.json(getJsonState("ARMED_HOME", data.armStateArmHome ? "New State" : "Current State"));
    });
  }
});

/** 
app.get("/lock/state", (request, response) => {
  console.log("/lock/state: Start " + new Date().toISOString());
  if (alarm.installation == null) {
    console.log("/lock/state: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/lock/state: Fetching");
    lock.getCurrentLockState(function (data) {
      console.log("/lock/state: Response: " + JSON.stringify(data));
      if (data.motorJam) {
        // Jamed
        response.status(500);
        response.json(getJsonState("JAMMED", ""));
      } else if (data.currentLockState === "LOCKED") {
        // LOCKED
        response.status(200);
        response.json(getJsonState("LOCKED", ""));
      } else if (data.currentLockState === "UNLOCKED") {
        // UNLOCKED
        response.status(200);
        response.json(getJsonState("UNLOCKED", ""));
      } else {
        response.status(500);
        response.json(getJsonState("ERROR", data));
      }
    });
  }
});

app.get("/lock/lock", (request, response) => {
  if (alarm.installation == null) {
    console.log("/lock/lock: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/lock/lock: Setting " + new Date().toISOString());
    lock.setTargetLockState(true, function (data) {
      console.log("/lock/lock: Response: Received");
      if (data == "OK") {
        console.log("/lock/lock: Response: " + data);
        response.status(200);
        response.json(getJsonState("LOCKED", "New State"));
      } else if (data["errorCode"] == "VAL_00819") {
        console.log("/lock/lock: Response: Already Set State");
        response.status(200);
        response.json(getJsonState("LOCKED", "Current State"));
      } else {
        console.log(
          "/lock/lock: Response: " +
          data["errorGroup"] +
          " <> " +
          data["errorCode"] +
          " <> " +
          data["errorMessage"]
        );
        response.status(500);
        response.json(getJsonState("ERROR", data["errorMessage"]));
      }
    });
  }
});

app.get("/lock/unlock", (request, response) => {
  if (alarm.installation == null) {
    console.log("/lock/unlock: Init Failed");
    initAlarm();
    response.status(500);
    response.json(getJsonState("ERROR", "Init Failed"));
  } else {
    console.log("/lock/lock: Setting " + new Date().toISOString());
    lock.setTargetLockState(false, function (data) {
      console.log("/lock/unlock: Response: Received");
      if (data == "OK") {
        console.log("/lock/unlock: Response: " + data);
        response.status(200);
        response.json(getJsonState("UNLOCKED", "New State"));
      } else if (data["errorCode"] == "VAL_00819") {
        console.log("/lock/unlock: Response: Already Set State");
        response.status(200);
        response.json(getJsonState("UNLOCKED", "Current State"));
      } else {
        console.log(
          "/lock/unlock: Response: " +
          data["errorGroup"] +
          " <> " +
          data["errorCode"] +
          " <> " +
          data["errorMessage"]
        );
        response.status(500);
        response.json(getJsonState("ERROR", data["errorMessage"]));
      }
    });
  }
});

*/

app.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err);
  }
  initAlarm();
  console.log("server is listening on " + port);
});

function initAlarm() {
  alarm.init(function (data) {
    console.log("Setting up Lock...");
    lock = new Lock(alarm);
    console.log("done");
  });
}

app.set("json spaces", 40);

function getJsonState(state, message) {
  json = '{"state":"' + state + '","message":"' + message + '"}';
  return JSON.parse(json);
}
