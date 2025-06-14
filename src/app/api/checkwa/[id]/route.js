import { NextResponse } from "next/server";
import DbConnect from "@/lib/DbConnect";
import Todo from "@/models/todo";

export async function GET(request, { params }) {
    await DbConnect();
    const userid = params.id;
    const data = await Todo.findOne({ userid });
    if (!data) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    const now = Date.now();
    const joinedAt = data.whatsapp_joined_at ? new Date(data.whatsapp_joined_at).getTime() : 0;
    const expired = now - joinedAt > 23 * 60 * 60 * 1000;
    if (expired) {
        data.whatsapp_joined = false;
        data.whatsapp_joined_at = null;
        await data.save();
    }
    return NextResponse.json({ joined: data.whatsapp_joined });
}
