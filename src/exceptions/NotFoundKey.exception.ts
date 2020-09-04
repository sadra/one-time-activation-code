export default class NotFoundKeyException extends Error {
  constructor(message: string = 'Sorry, there is no activation code. Please try again to get new code.') {
    super(message);
  }
}
