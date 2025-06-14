import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Todo from '@/models/todo';
import DbConnect from '@/lib/DbConnect';

export const GET = async (req, { params }) => {
  try {
    await DbConnect();
    const userid = await params.id;
    const existing = await Todo.findOne({ userid: userid });
    if (!existing) {
      // If user not found, return empty list
      return NextResponse.json({ success: true, data: { todos: [] } });
    }

    return NextResponse.json({ success: true, data: { todos: existing.todos } });
  } catch (error) {
    console.error('GET /api/give error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch todos' }, { status: 500 });
  }
};
