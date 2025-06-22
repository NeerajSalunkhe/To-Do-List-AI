import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export async function GET() {
  try {
    await DbConnect();

    const allUsers = await Todo.find({});
    let sentCount = 0;

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    for (const user of allUsers) {
      const { email, whatsapp_joined, whatsapp_joined_at } = user;

      if (!email || !whatsapp_joined || !whatsapp_joined_at) continue;

      const now = Date.now();
      const joinedAt = new Date(whatsapp_joined_at).getTime();
      const hoursSinceJoined = (now - joinedAt) / (1000 * 60 * 60);

      if (hoursSinceJoined >= 6) {
        try {
          await transporter.sendMail({
            from: `"HelpShare" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Renew WhatsApp Reminder Access',
            text: `👋 Hey! Your WhatsApp reminders will stop soon.

Click the link below to renew instantly:
⬇️ Tap to Renew
🔗 https://wa.me/14155238886?text=join%20stranger-said

⏳ Takes 2 seconds to stay connected! ✅`,
          });

          // Reset join time
          user.whatsapp_joined_at = new Date().toISOString();
          await user.save();
          sentCount++;
        } catch (err) {
          console.error(`❌ Failed to email ${email}:`, err.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ Sent ${sentCount} email renewal reminders.`,
    });
  } catch (error) {
    console.error('❌ Email renewal error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
