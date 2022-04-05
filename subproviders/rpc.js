
const inherits = require('util').inherits
const createPayload = require('../util/create-payload.js')
const Subprovider = require('./subprovider.js')
const { ethErrors, serializeError } = require('eth-rpc-errors')
require('es6-promise').polyfill();
require('isomorphic-fetch');

module.exports = RpcSource

inherits(RpcSource, Subprovider)

function RpcSource(opts) {
  const self = this
  self.rpcUrl = opts.rpcUrl
}

RpcSource.prototype.handleRequest = function(payload, next, end){
  const self = this
  const targetUrl = self.rpcUrl

  // overwrite id to conflict with other concurrent users
  const sanitizedPayload = sanitizePayload(payload)
  const newPayload = createPayload(sanitizedPayload)

  fetch(targetUrl, {
    uri: targetUrl,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newPayload),
    rejectUnauthorized: false,
    timeout: 20000,
  })
  .then((res) => {
    if (res.status != 200) {
      return new Error("HTTP Error: " + res.statusCode + " on " + method);

    }

    // parse response
    let data
    try {
      data = res.json()
    } catch (err) {
      console.error(err.stack)
      return end(serializeError(err))
    }
    if (data.error)  return err

    end(null, data.result)
  })
  .catch((error) => {
    return end(error)
  })
}

// drops any non-standard params
function sanitizePayload (payload) {
  return {
    id: payload.id,
    jsonrpc: payload.jsonrpc,
    method: payload.method,
    params: payload.params,
  }
}
