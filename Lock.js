class Lock {
  constructor(alarm) {
    this.alarmCode = alarm.alarmCode;
    this.installation = alarm.installation;
    this.lockSerial = alarm.lockSerial;
  }

  getDoorLockState() {
    const request = {
      url: "/doorlockstate/search",
    };

    return this.installation
      .client(request)
      .then((doorLocks) =>
        doorLocks.find((doorLock) => doorLock.deviceLabel === this.lockSerial)
      )
      .then((doorLock) => {
        if (!doorLock) {
          throw Error(`Could not find lock state for ${this.lockSerial}.`);
        }
        return doorLock;
      });
  }

  getCurrentLockState(callback) {
    this.log("Getting current lock state.");
    this.getDoorLockState()
      .then((doorLock) => {
        callback(doorLock);
      })
      .catch(callback);
  }

  /** 
  getTargetLockState(callback) {
    this.log('Getting target lock state.');
    this.getDoorLockState().then((doorLock) => {
      const { pendingLockState, currentLockState } = doorLock;

      const targetLockState = pendingLockState === 'NONE'
        ? currentLockState : pendingLockState;
      callback(null, targetLockState === 'LOCKED'
        ? "LOCKED" : "UNLOCKED");
    }).catch(callback);
  }*/

  setTargetLockState(value, callback) {
    this.log(`Setting target lock state to: ${value}`);

    const request = {
      method: "PUT",
      url: `/device/${this.lockSerial}/${value ? "lock" : "unlock"}`,
      data: { code: this.alarmCode },
    };

    this.installation
      .client(request)
      .then(({ doorLockStateChangeTransactionId }) =>
        this.resolveChangeResult(
          `/doorlockstate/change/result/${doorLockStateChangeTransactionId}`
        )
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

module.exports = Lock;
