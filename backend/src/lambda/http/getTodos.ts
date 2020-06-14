import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('getTodos')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // Get userId from auth token
  const jwt = event.headers.Authorization.split(' ').pop()
  const userId = parseUserId(jwt)
  const todos = await getTodosForUser(userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ items: todos })
  }
}

async function getTodosForUser(userId: string) {

  logger.info(`Fetching todos for user ${userId}`, {
    key: userId,
  })

  const result = await docClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise()

  logger.info('Result ', {
    key: result
  })

  return result.Items
}
