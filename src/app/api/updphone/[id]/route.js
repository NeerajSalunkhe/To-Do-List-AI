import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export async function POST(request, { params }) {
  await DbConnect();

  const userid = params.id;
  const data = await request.json();
  const { phone, email } = data;

  if (!userid || !phone || !email) {
    return NextResponse.json(
      { success: false, message: "Missing 'userid', 'phone', or 'email'" },
      { status: 400 }
    );
  }

  try {
    const updated = await Todo.findOneAndUpdate(
      { userid },
      {
        $set: {
          phone,
          email
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json(
      { success: true, message: 'Phone and email updated', data: updated },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
