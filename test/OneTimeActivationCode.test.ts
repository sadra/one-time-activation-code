import { ActivationCode } from '../src/types/ActivationCode.type';
import NotFoundKeyException from '../src/exceptions/NotFoundKey.exception';
import ReachedToAttemptsException from '../src/exceptions/ReachedToAttempts.exception';
import { OneTimeActivationCode } from '../src';
const NodeCache = require('node-cache');
const crypto = require('crypto');

describe('One Time Activation Code Test', () => {
  let oneTimeActivationCode: OneTimeActivationCode;

  describe('With default options', () => {
    beforeEach(() => {
      oneTimeActivationCode = new OneTimeActivationCode();
      oneTimeActivationCode.cacheSystem = {
        set: jest.fn(),
        get: jest.fn().mockReturnValue({
          code: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
          attempts: 0,
        } as ActivationCode),
        del: jest.fn(),
        getTtl: jest.fn().mockReturnValue(50000),
      } as typeof NodeCache;
    });

    it('should be defined', () => {
      expect(oneTimeActivationCode).toBeDefined();
    });

    describe('set code', () => {
      it('should call the cacheSystem.set with correct arguments', () => {
        const encodedCode = crypto.createHash('sha256').update('123456').digest('hex');

        oneTimeActivationCode.set('the_key', '123456');

        expect(oneTimeActivationCode.cacheSystem.set).toBeCalledWith(
          `otac_the_key`,
          {
            code: encodedCode,
            attempts: 0,
          } as ActivationCode,
          180,
        );
      });
    });

    describe('get code', () => {
      it('should call the cacheSystem.set with correct dto', () => {
        oneTimeActivationCode.get('the_key');

        expect(oneTimeActivationCode.cacheSystem.get).toBeCalledWith(`otac_the_key`);
      });

      it('should throw NotFoundKeyException if there is no verificationCode in chacheSystem', () => {
        oneTimeActivationCode.cacheSystem.get = jest.fn().mockReturnValue(null);

        expect(() => {
          oneTimeActivationCode.get('the_key');
        }).toThrow(NotFoundKeyException);
      });

      it('should return result as ActivationCode type', () => {
        const result = oneTimeActivationCode.get('the_key');

        expect(result).toEqual({
          attempts: expect.any(Number),
          code: expect.any(String),
        } as ActivationCode);
      });
    });

    describe('isValid', () => {
      it('should should throw NotFoundException if key is not found', () => {
        oneTimeActivationCode.cacheSystem.get = jest.fn().mockReturnValue(null);

        expect(() => {
          oneTimeActivationCode.isValid('the_key', '123456');
        }).toThrow(NotFoundKeyException);
      });

      it('should not throw ReachedToAttemptsException if attemptsChance is more than zero, and user activation is reached attempts', () => {
        expect(() => {
          oneTimeActivationCode.isValid('the_key', '123456');
        }).not.toThrow(ReachedToAttemptsException);
      });

      it('should increment activationCode and call the cacheSystem.set with new arguments ', () => {
        const encodedCode = crypto.createHash('sha256').update('123456').digest('hex');

        oneTimeActivationCode.isValid('the_key', '123456');

        expect(oneTimeActivationCode.cacheSystem.set).toBeCalledWith(
          `otac_the_key`,
          {
            code: encodedCode,
            attempts: 1,
          } as ActivationCode,
          50000,
        );
      });

      it('should return false is codes are not equals', () => {
        const result = oneTimeActivationCode.isValid('the_key', '1234567');

        expect(result).toBeFalsy();
      });

      it('should call cacheSystem and delete activationCode if codes were equal', () => {
        oneTimeActivationCode.isValid('the_key', '123456');

        expect(oneTimeActivationCode.cacheSystem.del).toBeCalledWith(`otac_the_key`);
      });

      it('should return true is codes are equals', () => {
        const result = oneTimeActivationCode.isValid('the_key', '123456');

        expect(result).toBeTruthy();
      });
    });
  });

  describe('With custom options', () => {
    beforeEach(() => {
      oneTimeActivationCode = new OneTimeActivationCode({
        attemptsChance: 3,
        encodeCode: false,
        expiresOn: 60,
      });

      oneTimeActivationCode.cacheSystem = {
        set: jest.fn(),
        get: jest.fn().mockReturnValue({
          code: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
          attempts: 3,
        } as ActivationCode),
        del: jest.fn(),
        getTtl: jest.fn().mockReturnValue(50000),
      } as typeof NodeCache;
    });

    it('should be defined', () => {
      expect(oneTimeActivationCode).toBeDefined();
    });

    describe('set code', () => {
      it('should call the cacheSystem.set with encoded code if encodeCode set to true', () => {
        oneTimeActivationCode.encodeCode = true;

        const encodedCode = crypto.createHash('sha256').update('123456').digest('hex');

        oneTimeActivationCode.set('the_key', '123456');

        expect(oneTimeActivationCode.cacheSystem.set).toBeCalledWith(
          `otac_the_key`,
          {
            code: encodedCode,
            attempts: 0,
          } as ActivationCode,
          60,
        );
      });

      it('should call the cacheSystem.set with real code if encodeCode set to false', () => {
        oneTimeActivationCode.encodeCode = false;

        oneTimeActivationCode.set('the_key', '123456');

        expect(oneTimeActivationCode.cacheSystem.set).toBeCalledWith(
          `otac_the_key`,
          {
            code: '123456',
            attempts: 0,
          } as ActivationCode,
          60,
        );
      });
    });

    describe('isValid', () => {
      it('should not throw ReachedToAttemptsException if attemptsChance is more than zero, and user activation is reached attempts', () => {
        expect(() => {
          oneTimeActivationCode.isValid('the_key', '123456');
        }).toThrow(ReachedToAttemptsException);
      });
    });
  });
});
