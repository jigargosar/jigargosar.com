import auth0 from 'auth0-js'

export class Auth0 {
  auth0 = new auth0.WebAuth({
    domain: 'jigargosar.auth0.com',
    clientID: 'Ly0LvRR6KxhF8MyTp8JDnpIa5YMKXSut',
    redirectUri: 'http://localhost:3000/callback',
    audience: 'https://jigargosar.auth0.com/userinfo',
    responseType: 'token id_token',
    scope: 'openid',
  })

  login() {
    this.auth0.authorize()
  }
}
