const Verisure = require("verisure");

class Alarm {
  constructor(username, password, code) {
    this.alarmUser = username;
    this.alarmPassword = password;
    this.alarmCode = code;
    this.installation = null;
  }

  init() {
    const verisure = new Verisure(this.alarmUser, this.alarmPassword);
    console.log("Starting Versiure...");

    verisure
      .getToken()
      .then(() => verisure.getInstallations())
      .then((installations) => {
        this.installation = installations[0];
        console.log("Starting Versiure...Done");
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getCurrentInstallation(callback) {
    this.installation
      .getOverview()
      .then((overview) => {
        callback(overview);
      })
      .catch(callback);
  }

  getCurrentAlarmState(callback) {
    this.installation
      .getOverview()
      .then((overview) => {
        callback(overview.armState.statusType);
      })
      .catch(callback);
  }

  setTargetAlarmState(value, callback) {
    this.log(`Setting target alarm state to: ${value}`);

    const request = {
      method: "PUT",
      url: "/armstate/code",
      data: {
        code: this.alarmCode,
        state: value,
      },
    };
    this.installation
      .client(request)
      .then(({ armStateChangeTransactionId }) =>
        this.resolveChangeResult(`/code/result/${armStateChangeTransactionId}`)
      )
      .then((result) => {
        callback(result);
      })
      .catch(callback);
  }

  resolveChangeResult(url) {
    this.log(`Resolving: ${url}`);

    return this.installation.client({ url }).then(({ result }) => {
      this.log(`Got "${result}" back from: ${url}`);
      if (typeof result === "undefined" || result === "NO_DATA") {
        return new Promise((resolve) =>
          setTimeout(() => resolve(this.resolveChangeResult(url)), 200)
        );
      }
      return result;
    });
  }

  log(message) {
    return console.log(`${message}`);
  }
}

module.exports = Alarm;
