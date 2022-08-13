# com.svipler.verisure-state-api

To install:
Create a file config.js in root folder:
{
    "username" : "username",
    "password" : "password",
    "code": "pincode",
    "lockserial": "serialnumber to  your door lock"
}

Then run:
npm install
node app.js


Actions:
/ - Status
/state - Current State
/overview - Full Verisure Overview

/state/arm - Will do Arm
/state/disarm - Will do Disarm
/state/home - Will do Home Arm

/lock/state - Check Lock State
/lock/lock - Will lock Lock
/lock/unlock - Will unlock Lock

