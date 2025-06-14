import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export async function POST(request, { params }) {
    await DbConnect();
    const userid = params.id;
    await Todo.updateOne(
        { userid: userid },
        { $set: { whatsapp_joined: false, whatsapp_joined_at: null } }
    );
    return NextResponse.json({ success: true });
}
