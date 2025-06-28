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

      if (hoursSinceJoined > 12) {
        try {
          await transporter.sendMail({
            from: `To-Do List AI`,
            to: email,
            subject: '🔄 Renew WhatsApp Reminder Access',
            html: `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #0e0e0e; padding: 40px 20px; color: #f0f0f0;">
    <div style="max-width: 600px; margin: auto; background: #1a1a1a; border-radius: 16px; overflow: hidden; box-shadow: 0 0 20px rgba(0,255,200,0.05), 0 0 60px rgba(0,255,200,0.03); border: 1px solid #2b2b2b;">
      
      <div style="padding: 32px 24px; text-align: center;">
        <img src="https://to-do-list-ai.vercel.app/to-do-list.gif" alt="To-Do List" style="max-width: 220px; margin-bottom: 24px; border-radius: 8px;" />

        <h2 style="font-size: 22px; color: #90cdf4; margin-bottom: 10px;">WhatsApp Reminder Access Expiring</h2>
        
        <p style="font-size: 16px; color: #cccccc; margin: 20px 0 30px; line-height: 1.6;">
          👋 Hey there! To keep receiving timely <strong>task reminders</strong> via WhatsApp, please renew your access.<br />It only takes a few seconds.
        </p>

        <a href="https://wa.me/14155238886?text=join%20stranger-said"
           style="display: inline-block; padding: 14px 28px; font-size: 16px; background: linear-gradient(135deg, #00c97d, #00e4a8); color: #000; border-radius: 10px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 14px rgba(0,255,200,0.2); transition: background 0.3s;">
           🔁 Tap to Renew WhatsApp Access
        </a>

        <p style="font-size: 14px; color: #999; margin-top: 24px;">
          ✅ Stay connected. No action means your reminders will stop.
        </p>
      </div>

      <div style="padding: 16px; text-align: center; background-color: #141414; font-size: 12px; color: #666;">
        Sent by <a href="https://to-do-list-ai.vercel.app/" style="color: #4f46e5; text-decoration: none;">To-Do List AI</a> • Built for productivity
      </div>
    </div>
  </div>
`

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
