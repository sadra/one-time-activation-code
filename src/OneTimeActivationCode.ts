import { ActivationCode } from './types/ActivationCode.type';
import ReachedToAttemptsException from './exceptions/ReachedToAttempts.exception';
import NotFoundKeyException from './exceptions/NotFoundKey.exception';
import NodeCache from 'node-cache';
import crypto from 'crypto';

export default class OneTimeActivationCode {
  encodeCode: boolean = true;
  expiresOn: number = 180;
  attemptsChance: number = 0;
  cacheSystem = new NodeCache();

  constructor(options?: { encodeCode?: boolean; expiresOn?: number; attemptsChance?: number }) {
    if (options && options.encodeCode) {
      this.encodeCode = options.encodeCode;
    }

    if (options && options.expiresOn) {
      this.expiresOn = options.expiresOn;
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

    this.cacheSystem.set(`otac_${key}`, activationCode, this.expiresOn);
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
    const ttl = this.cacheSystem.getTtl(`otac_${key}`) || -1;

    this.handleAttempts(key, activationCode, ttl);

    if (activationCode.code !== encodedCode) {
      return false;
    }

    this.cacheSystem.del(`otac_${key}`);

    return true;
  }

  private handleAttempts(key: string, activationCode: ActivationCode, ttl: number) {
    if (this.attemptsChance > 0) {
      if (activationCode.attempts >= this.attemptsChance) {
        throw new ReachedToAttemptsException(
          `Sorry, you\'ve reached to more than ${
            activationCode.attempts
          } attempts. Please try again ${this.getExpireTime(ttl)} later`,
        );
      }
    }

    activationCode.attempts++;
    this.cacheSystem.set(`otac_${key}`, activationCode, ttl);
  }

  private getExpireTime = (millis: number): string => {
    const minutes = Math.floor(millis / 60000);
    const seconds = parseInt(((millis % 60000) / 1000).toFixed(0), 10);
    return seconds === 60 ? minutes + 1 + ':00' : minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };
}
