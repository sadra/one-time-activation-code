# One Time Activation Code [![NPM](https://nodei.co/npm/one-time-activation-code.png)](https://nodei.co/npm/one-time-activation-code/)

![](https://img.shields.io/npm/l/one-time-activation-code)
[![NPM package version](https://img.shields.io/npm/v/one-time-activation-code?label=npm%20package)](https://www.npmjs.com/package/one-time-activation-code)
[![GitHub issues](https://img.shields.io/github/issues/sadra/one-time-activation-code)](https://github.com/sadra/one-time-activation-code/issues)
![Coveralls Coverage](https://img.shields.io/badge/Coverage-89.09%25-yellow.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Twitter](https://img.shields.io/twitter/follow/sadra_me?style=social)](https://twitter.com/sadra_me)
## About

If you have authentication and authorize your user identification by activation codes, you probably encountered with managing the activation code issue.

With this package, you could solve all your issue in one-time activation codes.

**Features**
 - Store activation codes in fast `cache memory`.
 - Delete activation code after a specific time automatically with `expiration`.
 - Restrict the user to prevent trying more than defined `attempts chance`.
 - Delete activation code after validation automatically.

## Install 🐙

Just add the package into your project.

```bash
npm install one-time-activation-code --save
```

## How to use 💡

Then Import it in the target file.

```typescript
import OneTimeActivationCode from 'one-time-activation-code'
```

or in old js

```js
const OneTimeActivationCode = require('one-time-activation-code');
```

Then create an instance.

```ts
const otac = new OneTimeActivationCode({
    expiresAfter: 500,
    attemptsChance: 3,
    encodeCode: true,
});
```

Or you can create the instance with options:

| Params         | Description                                                  | Default | Mandatory |
| -------------- | ------------------------------------------------------------ | ------- | --------- |
| expiresAfter      | Expire and delete activation code after `n`  **seconds**. | 180 (seconds) | NO        |
| attemptsChance | Attempts chance to enter wrong validations. It should be more than 0. | 0       | NO        |
| encodeCode     | Sote activation code in encoded or cleared string. | true    | NO        |

### Set Activation Code

First of all, you need store the _activation code_ with a _unique key_.

**User Story:**

- Store activation code for user
- We Send this activation to its email
- The user's email address is `text@gmail.com`
- And the activation code is `123456`

```ts
otac.set('text@gmail.com', '123456');
```

### Validate Activation Code

To validate activation code you should again pass the user entered _code_ with its _unique identification key_ that we store before.

```ts
otac.isValid('text@gmail.com', '123456');
```

If the activation code was **valid** it returns `true` and then delete the `activation code` from the store.

If the activation code was **invalid** it returns `false` and increment the `attempts`.

### Get Activation Code object

The activation code store as an object with two parameters `attempts` and `code`.

- `code`: The **encoded** or **clear text** of activation code that you set before. It stores in `encoded` _Sha256_ by default.
- `attempts`: Shows how many times the user tries to validate activation code.

```ts
otac.get('text@gmail.com')
```

Then, it returns:

```json
{
    "code": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
    "attempts": 2
}
```

If `encode` was set to **false**:

```json
{
    "code": "123456",
    "attempts": 2
}
```

### Exceptions

#### Attempts Restrictions

If you set `attemptsChance` in options, whenever user attempts reached to **attemptsChance** then the function throw and exception with `ReachedToAttemptsException` type. So, you should handle this type of exception.

```ts
import {ReachedToAttemptsException} from 'one-time-activation-code'

try{
	otac.isValid('text@gmail.com', '121212');
}catch(error){
    if(error instanceof ReachedToAttemptsException){
       console.log(error.message) 
    }
}

//console: Sorry, you've reached to more than 3 attempts. Please try again 1m 22s later.
```

#### Not Found Key

As we know if activation coed exceeds to its expiration or maybe activated before, it deleted automatically. So if you try check validation or just get the the activation object, it throw exception with `NotFoundKeyException` type. So, you should handle this type of exception too.

```ts
import {NotFoundKeyException} from 'one-time-activation-code'

try{
	otac.isValid('text@gmail.com', '121212');
}catch(error){
    if(error instanceof NotFoundKeyException){
       console.log(error.message) 
    }
}

//console: Sorry, there is no activation code. Please try again to get new code.
```

So the user should request for new activation code.

## Contributing 🍰
Please make sure to read the [Contributing Guide](https://github.com/sadra/one-time-activation-code/blob/master/.github/CONTRIBUTING.md) before making a pull request.

Thank you to all the people who already contributed to this project!

## Maintainers 👷
List of maintainers, replace all `href`, `src` attributes by your maintainers datas.
<table>
  <tr>
    <td align="center"><a href="https://sadra.me/"><img src="https://avatars0.githubusercontent.com/u/18361407?s=460&u=0f9a90e53abcfa75f087b679e55dcf8423d8a89a&v=4" width="100px;" alt="Sadra Isapanah Amlashi"/><br /><sub><b>Sadra Isapanah Amlashi</b></sub></a><br /><a href="#" title="Code">💻</a></td>
  </tr>
</table>

## License ⚖️
MIT

