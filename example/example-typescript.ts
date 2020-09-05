import OneTimeActivationCode from '../lib'
import {NotFoundKeyException, ReachedToAttemptsException} from '../lib'

class ExampleTypescript {
   otac = new OneTimeActivationCode({attemptsChance: 2});

  setActivationCode() {
    this.otac.set("test@example.com", "123456");
  }

   printActivationCode() {
    console.log(this.otac.get("test@example.com"));
  }

   validationActivationCode() {
    try{
      this.otac.isValid("test@example.com", "121212");
      this.otac.isValid("test@example.com", "121212");
      this.otac.isValid("test@example.com", "121212");
    }catch (error) {
      if(error instanceof ReachedToAttemptsException){
        console.log('ReachedToAttemptsException: ', error.message)
      }

      if(error instanceof NotFoundKeyException){
        console.log('NotFoundKeyException: ', error.message)
      }
    }
  }
}

const example = new ExampleTypescript()

example.setActivationCode()
example.printActivationCode()
example.validationActivationCode()
