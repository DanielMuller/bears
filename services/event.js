'use strict'
const log = require('lambda-log')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true })
const TableName = process.env.TableName

exports.handler = (event) => {
  const startTime = new Date()
  log.options.meta.requestId = event.requestContext.requestId

  let eventName
  try {
    eventName = event.pathParameters.eventName
    log.options.meta.eventName = eventName
    log.info('event', { event })
  } catch (err) {
    log.error('event', { event })
    return error(400, { message: 'Missing eventName' })
  }

  let payload = null
  if ('body' in event) {
    if (event.isBase64Encoded) {
      payload = JSON.parse(Buffer.alloc(event.body).toString())
    } else {
      payload = JSON.parse(event.body)
    }
  }

  log.info('payload', { payload, isBase64Encoded: event.isBase64Encoded })

  const params = {
    TableName,
    Item: {
      eventName,
      'createdAt-requestId': `${event.requestContext.timeEpoch}-${event.requestContext.requestId}`,
      userAgent: event.requestContext.http.userAgent,
      sourceIp: event.requestContext.http.sourceIp,
      payload
    }
  }

  log.info('store', { params })
  return dynamo.put(params).promise().then(res => {
    log.info('dynamodb', { res })
    const response = {
      eventName,
      message: 'Your event has been recorded',
      payload
    }

    const timings = getTimings(startTime)
    log.info('end', { type: 'success', timings })

    return response
  })
    .catch((err) => {
      log.error('dynamodb', { event, params, err })
      const timings = getTimings(startTime)
      log.info('end', { type: 'failure', timings })
      return error(500, { message: err.message })
    })
}

const error = (code, body) => {
  return {
    statusCode: parseInt(code),
    isBase64Encoded: false,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

const getTimings = startTime => {
  const endTime = new Date()
  return {
    startTime,
    endTime,
    duration: endTime - startTime
  }
}
