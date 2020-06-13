// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'w079lbm6ea'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`
// export const apiEndpoint = `http://localhost:8080/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-1nt0v2c1.auth0.com',            // Auth0 domain
  clientId: '3BMUSSxYncVpMbR0A0G0ULq1CuuZvY7v',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
