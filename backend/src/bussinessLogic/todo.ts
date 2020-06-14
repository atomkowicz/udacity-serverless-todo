import { TodoItem } from "../models/TodoItem"
import 'source-map-support/register'
import { getAllTodos, createTodo } from "../dataLayer/todoAccess"
import * as uuid from 'uuid'
import { CreateTodoRequest } from "../requests/CreateTodoRequest"

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    const result = await getAllTodos(userId)
    return result
}

export async function createTodoForUser(parsedBody: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuid.v4()
    const timestamp = new Date().toISOString()
  
    const newTodo = {
      todoId: todoId,
      userId: userId,
      createdAt: timestamp,
      ...parsedBody,
      done: false
    }

    return await createTodo(newTodo)
}