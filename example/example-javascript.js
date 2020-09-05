const OneTimeActivationCode = require('../lib')
const {ReachedToAttemptsException, NotFoundKeyException} = require('../lib')

const otac = new OneTimeActivationCode({attemptsChance: 2});

function setActivationCode() {
  otac.set("test@example.com", "123456");
}

function printActivationCode() {
  console.log(otac.get("test@example.com"));
}

function validationActivationCode() {
  try{
    otac.isValid("test@example.com", "121212");
    otac.isValid("test@example.com", "121212");
    otac.isValid("test@example.com", "121212");
  }catch (error) {
    if(error instanceof ReachedToAttemptsException){
      console.log('ReachedToAttemptsException: ', error.message)
    }
    if(error instanceof NotFoundKeyException){
      console.log('NotFoundKeyException: ', error.message)
    }
  }
}

setActivationCode()
printActivationCode()
validationActivationCode()
