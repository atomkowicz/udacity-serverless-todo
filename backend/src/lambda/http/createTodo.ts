import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { parseUserId } from '../../auth/utils'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'

import * as AWSXRay from 'aws-xray-sdk';
const XAWS = AWSXRay.captureAWS(AWS) as typeof AWS

const logger = createLogger('createTodo')
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const parsedBody: CreateTodoRequest = JSON.parse(event.body)

  const todoId = uuid.v4()
  const jwt = event.headers.Authorization.split(' ').pop()
  const userId = parseUserId(jwt)
  const timestamp = new Date().toISOString()

  const newTodo = {
    todoId: todoId,
    userId: userId,
    createdAt: timestamp,
    ...parsedBody,
  }

  await docClient.put({
    TableName: todosTable,
    Item: newTodo
  }).promise()

  logger.info(`Todo Created`, {
    key: newTodo,
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newTodo
    })
  }
}
