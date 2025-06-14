import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export async function POST(request, { params }) {
    await DbConnect();
    const userid = params.id;
    await Todo.updateOne(
        { userid: userid },
        { $set: { whatsapp_joined: true, whatsapp_joined_at: new Date() } }
    );
    return NextResponse.json({ success: true });
}
