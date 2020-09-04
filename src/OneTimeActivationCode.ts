import { ActivationCode } from './types/ActivationCode.type';
import ReachedToAttemptsException from './exceptions/ReachedToAttempts.exception';
import NotFoundKeyException from './exceptions/NotFoundKey.exception';
import NodeCache from 'node-cache';
import crypto from 'crypto';

export default class OneTimeActivationCode {
  encodeCode: boolean = true;
  expiresAfter: number = 180;
  attemptsChance: number = 0;
  cacheSystem = new NodeCache();

  constructor(options?: { encodeCode?: boolean; expiresAfter?: number; attemptsChance?: number }) {
    if (options && options.encodeCode) {
      this.encodeCode = options.encodeCode;
    }

    if (options && options.expiresAfter) {
      this.expiresAfter = options.expiresAfter;
    }

    if (options && options.attemptsChance) {
      this.attemptsChance = options.attemptsChance;
    }
  }

  set(key: string, code: string): void {
    const encodedCode = this.encodeCode ? crypto.createHash('sha256').update(code).digest('hex') : code;

    const activationCode: ActivationCode = {
      attempts: 0,
      code: encodedCode,
    };

    this.cacheSystem.set(`otac_${key}`, activationCode, this.expiresAfter);
  }

  get(key: string): ActivationCode {
    const activationCode = this.cacheSystem.get(`otac_${key}`);

    if (!activationCode) {
      throw new NotFoundKeyException();
    }

    return activationCode as ActivationCode;
  }

  isValid(key: string, code: string): boolean {
    const encodedCode = this.encodeCode ? crypto.createHash('sha256').update(code).digest('hex') : code;
    const activationCode = this.get(key);

    this.handleAttempts(key, activationCode);

    if (activationCode.code !== encodedCode) {
      return false;
    }

    this.cacheSystem.del(`otac_${key}`);

    return true;
  }

  private handleAttempts(key: string, activationCode: ActivationCode) {
    const ttl = (this.cacheSystem.getTtl(`otac_${key}`) || new Date().getTime()) - new Date().getTime();

    if (this.attemptsChance > 0) {
      if (activationCode.attempts >= this.attemptsChance) {
        throw new ReachedToAttemptsException(
          `Sorry, you\'ve reached to ${activationCode.attempts} attempts. Please try again ${this.timeConversion(
            ttl,
          )} later`,
        );
      }
    }

    activationCode.attempts++;
    this.cacheSystem.set(`otac_${key}`, activationCode, Math.floor(ttl / 1000));
  }

  private timeConversion = (duration: number) => {
    const portions: string[] = [];

    const msInHour = 1000 * 60 * 60;
    const hours = Math.trunc(duration / msInHour);
    if (hours > 0) {
      portions.push(hours + 'h');
      duration = duration - hours * msInHour;
    }

    const msInMinute = 1000 * 60;
    const minutes = Math.trunc(duration / msInMinute);
    if (minutes > 0) {
      portions.push(minutes + 'm');
      duration = duration - minutes * msInMinute;
    }

    const seconds = Math.trunc(duration / 1000);
    if (seconds > 0) {
      portions.push(seconds + 's');
    }

    return portions.join(' ');
  };
}
