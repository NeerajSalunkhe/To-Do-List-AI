import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export const POST = async (req) => {
  try {
    await DbConnect();

    const { userid, todoid } = await req.json();

    if (!userid || !todoid) {
      return NextResponse.json({ success: false, error: 'Missing userid or todoid' }, { status: 400 });
    }

    const userTodos = await Todo.findOne({ userid });

    if (!userTodos) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const todoItem = userTodos.todos.find((todo) => todo.todo_id === todoid);

    if (!todoItem) {
      return NextResponse.json({ success: false, error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reminderAt: todoItem.reminderAt || null });
  } catch (error) {
    console.error('POST /api/reminderat error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
