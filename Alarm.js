const Verisure = require("verisure");
const { json } = require("express");

class Alarm {
  constructor(username, password, code, lockSerial) {
    this.alarmUser = username;
    this.alarmPassword = password;
    this.alarmCode = code;
    this.lockSerial = lockSerial;
    this.installation = null;
  }

  init(callback) {
    const verisure = new Verisure(this.alarmUser, this.alarmPassword);
    console.log("Starting Versiure...");

    verisure
      .getToken()
      .then(() => verisure.getInstallations())
      .then((installations) => {
        this.installation = installations[0];
        console.log("Starting Versiure...Done");
        callback();
      })
      .catch((error) => {
        console.error(error);
        callback();
      });
  }

  getCurrentInstallation(callback) {
    const request = {
      operationName: 'Overview',
      query: `query Overview($giid: String!) {
          installation(giid: $giid) {
            alias
            locale
            climates {
              device {
                deviceLabel
                area
                gui {
                  label
                  __typename
                }
                __typename
              }
              humidityEnabled
              humidityTimestamp
              humidityValue
              temperatureTimestamp
              temperatureValue
              thresholds {
                aboveMaxAlert
                belowMinAlert
                sensorType
                __typename
              }
              __typename
            }
            armState {
              type
              statusType
              date
              name
              changedVia
              __typename
            }
            doorWindows {
              device {
                deviceLabel
                area
                gui {
                  support
                  label
                  __typename
                }
                __typename
              }
              type
              state
              wired
              reportTime
              __typename
            }
            smartplugs {
              device {
                deviceLabel
                area
                gui {
                  support
                  label
                  __typename
                }
                __typename
              }
              currentState
              icon
              isHazardous
              __typename
            }
            doorlocks {
              device {
                area
                deviceLabel
                __typename
              }
            }
            __typename
          }
        }`
    }

    this.installation
      .client(request)
      .then((result) => {
        callback(result.installation);
      })
      .catch(callback);
  }

  getCurrentAlarmState(callback) {
    const request = {
      operationName: 'ArmState',
      variables: { giid: this.installation.giid },
      query: `query ArmState($giid: String!) {
        installation(giid: $giid) {
          armState {
            type
            statusType
            date
            name
            changedVia
            __typename
          }
          __typename
        }
      }`,
    }

    this.installation
      .client(request)
      .then((result) => {
        callback(result.installation.armState.statusType);
      })
      .catch(callback);
  }

  getArmQuery(value) {
    switch (value) {
      case "ARMED_AWAY":
        return {
          operationName: 'armAway',
          variables: {
            giid: this.installation.giid,
            code: this.alarmCode
          },
          query: `
          mutation armAway($giid: String!, $code: String!) {
            armStateArmAway(giid: $giid, code: $code)
          }`,
        }
      case "ARMED_HOME":
        return {
          operationName: 'armHome',
          variables: {
            giid: this.installation.giid,
            code: this.alarmCode
          },
          query: `
          mutation armHome($giid: String!, $code: String!) {
            armStateArmHome(giid: $giid, code: $code)
          }`,
        }
      case "DISARMED":
        return {
          operationName: 'disarm',
          variables: {
            giid: this.installation.giid,
            code: this.alarmCode
          },
          query: `
          mutation disarm($giid: String!, $code: String!) {
            armStateDisarm(giid: $giid, code: $code)
          }`,
        }
    }
  }

  setTargetAlarmState(value, callback) {
    this.log(`Setting target alarm state to: ${value}`);

    this.installation
      .client(this.getArmQuery(value))
      .then((result) => {
        console.log(result)
        callback(result);
      })
      .catch(callback);
  }
  log(message) {
    return console.log(`${message}`);
  }
}

module.exports = Alarm;
