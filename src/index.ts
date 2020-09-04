import OneTimeActivationCode from './OneTimeActivationCode';
import ReachedToAttemptsException from './exceptions/ReachedToAttempts.exception';
import NotFoundKeyException from './exceptions/NotFoundKey.exception';

export = OneTimeActivationCode;

module.exports = {
  ReachedToAttemptsException,
  NotFoundKeyException,
};
