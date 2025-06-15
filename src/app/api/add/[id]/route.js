import { NextResponse } from "next/server";
import DbConnect from "@/lib/DbConnect";
import Todo from "@/models/todo";

export async function POST(request, { params }) {
  await DbConnect();
  const userid = await params.id;
  if (!userid) {
    return NextResponse.json(
      { success: false, message: "Missing user ID in URL" },
      { status: 400 }
    );
  }

  try {
    const { todos } = await request.json();
    if (!Array.isArray(todos) || todos.length === 0) {
      return NextResponse.json(
        { success: false, message: "Request body must include a non-empty `todos` array" },
        { status: 400 }
      );
    }
    
    const updated = await Todo.findOneAndUpdate(
      { userid },
      { $push: { todos: { $each: todos } } },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      { success: true, data: updated },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
