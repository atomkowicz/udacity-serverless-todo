import * as AWS from 'aws-sdk'
import { TodoItem } from "../models/TodoItem"
import { createLogger } from '../utils/logger'
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS) as typeof AWS
const docClient = new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const logger = createLogger('todo-data-layer')


export async function getAllTodos(userId: string): Promise<TodoItem[]> {

    const result = await docClient.query({
        TableName: todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
    }).promise()

    logger.info('Fetching todos for user ', {
        user: userId,
        key: result
    })

    return result.Items as TodoItem[]
}

export async function createTodo(newTodo: TodoItem): Promise<TodoItem> {

    await docClient.put({
        TableName: todosTable,
        Item: newTodo
    }).promise()

    logger.info('Todo Created', { key: newTodo })

    return newTodo
}