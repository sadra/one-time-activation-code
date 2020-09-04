export default class NotFoundKeyException extends Error {
  constructor(message: string = "Sorry, we couldn't find you. Please try again to get activation code.") {
    super(message);
  }
}
