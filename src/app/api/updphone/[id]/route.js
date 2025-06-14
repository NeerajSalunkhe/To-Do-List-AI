import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export async function POST(request, { params }) {
  await DbConnect();

  const userid = await params.id;
  const { phone } = await request.json();

  if (!userid || !phone) {
    return NextResponse.json(
      { success: false, message: "Missing 'userid' or 'phone'" },
      { status: 400 }
    );
  }

  try {
    // Update or create the user's phone number
    const updated = await Todo.findOneAndUpdate(
      { userid },
      { $set: { phone } },
      { new: true, upsert: true } // upsert will create document if not exists
    );

    return NextResponse.json(
      { success: true, message: 'Phone updated', data: updated },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
