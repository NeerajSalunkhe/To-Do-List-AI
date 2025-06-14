import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export async function DELETE(request, { params }) {
  await DbConnect();

  const userid = params.id; // ❌ Do NOT use `await` here
  const { searchParams } = new URL(request.url);
  const todoId = searchParams.get('key');

  if (!userid || !todoId) {
    return NextResponse.json(
      { success: false, message: "Missing 'id' or 'key' parameter" },
      { status: 400 }
    );
  }

  try {
    const updated = await Todo.findOneAndUpdate(
      { userid },
      { $pull: { todos: { todo_id: todoId } } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'User or todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
