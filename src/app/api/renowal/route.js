// app/api/send-whatsapp-renewals/route.js
import { NextResponse } from 'next/server';
import twilio from 'twilio';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export async function POST() {
    try {
        await DbConnect();

        const allUsers = await Todo.find({});
        let renewalCount = 0;

        for (const user of allUsers) {
            const { phone, whatsapp_joined, whatsapp_joined_at } = user;
            if (!phone || !whatsapp_joined || !whatsapp_joined_at) continue;

            const now = Date.now();
            const joinedAt = new Date(whatsapp_joined_at).getTime();
            const hoursSinceJoined = (now - joinedAt) / (1000 * 60 * 60);

            if (hoursSinceJoined >= 21){
                try {
                    await client.messages.create({
                        from: process.env.TWILIO_WHATSAPP_NUMBER,
                        to: `whatsapp:${phone}`,
                        body: `👋 Hey! Your WhatsApp reminders will stop soon.
Click the button below to renew instantly:
⬇️ *Tap to Renew*
🔗 https://wa.me/14155238886?text=join%20stranger-said

⏳ Takes 2 seconds to stay connected! ✅`,
                    });

                    user.whatsapp_joined_at = new Date().toISOString();
                    await user.save();
                    renewalCount++;
                } catch (err) {
                    console.error(`❌ Failed to message ${phone}:`, err.message);
                }
            }
        }
        return NextResponse.json({
            success: true,
            message: `✅ Sent ${renewalCount} WhatsApp renewal reminders.`,
        });
    } catch (error) {
        console.error('❌ API Error:', error);
        return NextResponse.json({ success: false, error: error.message });
    }
}
