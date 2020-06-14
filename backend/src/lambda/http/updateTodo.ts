import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { parseUserId, getUserIdFromAuthHeader } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'
import { updateTodoForUser } from '../../bussinessLogic/todo'


const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const parsedBody: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserIdFromAuthHeader(event.headers.Authorization)

  const result = await updateTodoForUser(parsedBody, userId, todoId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: result
  }
}