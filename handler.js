'use strict';
const https = require('https')
const url = require('url')

var signRequest = (requestOptions) => { return requestOptions }

if (process.env.AWS_SIGN_REQUESTS) {
  signRequest = require('aws4').sign
}

const httpsAgent = https.Agent({
  keepAlive: true,
  keepAliveMsecs: 300000
})

module.exports.proxy = (event, context, callback) => {
  var res = https.request(
    signRequest({
      hostname: process.env.URL,
      method: event.httpMethod,
      headers: event.headers,
      path: event.path,
      agent: httpsAgent,
      timeout: 30 /* maximum time for api gateway invoked Lambda */
    })
  )

  var resBody = ""
  
  res.on('data', (chunk) => {
    resBody += chunk
  }).on('end', () => {
    var response = {
      statusCode: res.statusCode,
      headers: res.headers,
      body: resBody
    }
    
    console.log(response)
    callback(null, response)
  })
}
