import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const todo: UpdateTodoRequest = JSON.parse(event.body)
  const jwt = event.headers.Authorization.split(' ').pop()
  const userId = parseUserId(jwt)

  try {
    const updatedTodo = await docClient.update({
      TableName: todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name" : todo.name,
        ":dueDate" : todo.dueDate,
        ":done" : todo.done,
      },
      ReturnValues: "ALL_NEW"
    }).promise()
    
    logger.info(`Updated todo : ${todoId}`)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({updatedTodo})
    }
  } catch (e) {

    logger.info(`Error when Updating todo : ${e}`)

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: "Error when Updating todo"
    }
  }

}
