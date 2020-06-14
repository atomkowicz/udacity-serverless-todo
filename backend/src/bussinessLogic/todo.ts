import { TodoItem } from "../models/TodoItem"
import 'source-map-support/register'
import { getAllTodos } from "../dataLayer/todoAccess"


export async function getTodosForUser(userId: string):Promise<TodoItem[]> {
    const result = await getAllTodos(userId)
    return result
}