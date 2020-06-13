import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const logger = createLogger('createTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const jwt = event.headers.Authorization.split(' ').pop()
  const userId = parseUserId(jwt)

  await docClient.delete({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    }
  }).promise()

  logger.info(`Todo deleted`, {
    key: todoId,
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: true
    })
  }
}
