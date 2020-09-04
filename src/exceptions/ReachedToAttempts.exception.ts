export default class ReachedToAttemptsException extends Error {
  constructor(message: string = "Sorry, you've reached the maximum number of attempts.") {
    super(message);
  }
}
