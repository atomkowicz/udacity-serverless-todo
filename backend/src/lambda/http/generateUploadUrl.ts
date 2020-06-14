import 'source-map-support/register'
import { parseUserId } from '../../auth/utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('generateUploadUrl')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todosbucket = process.env.TODOS_S3_BUCKET

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const jwt = event.headers.Authorization.split(' ').pop()
  const userId = parseUserId(jwt)

  const uploadUrl = await getPresignedURL(userId, todoId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Request-Method': "POST"
    },
    body: JSON.stringify({ uploadUrl })
  }
}

export async function getPresignedURL(userId: string, todoId: string): Promise<string> {
  const attachmentUrl = await getUploadPresignedURL(userId, todoId)
  await uploadAttachementToS3(userId, todoId) 
  return attachmentUrl;
}

export async function getUploadPresignedURL(userId: string, todoId: string): Promise<string> {
  logger.info(`Create signed url`,{
    userId: userId,
    todoId: todoId
  })

  const uploadURL = s3.getSignedUrl('putObject', {
    Bucket: todosbucket,
    Key: `${userId}/${todoId}`,
    Expires: 300
  })
  
  return uploadURL
}

export async function uploadAttachementToS3(userId: string, todoId: string): Promise<TodoItem> {
  
  const updatedTodo = await docClient.update({
    TableName: todosTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    },
    UpdateExpression: "set attachmentUrl = :attachmentUrl",
    ExpressionAttributeValues: {
      ":attachmentUrl" : `https://${todosbucket}.s3.amazonaws.com/${userId}/${todoId}`
    },
    ReturnValues: "ALL_NEW"
  }).promise()

  logger.info(`Todo ${todoId} updated with attachment : ${todoId}`)
  
  return updatedTodo.Attributes as TodoItem
}