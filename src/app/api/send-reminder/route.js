import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export async function GET() {
  await DbConnect();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    const allUsers = await Todo.find({});
    let sentCount = 0;

    for (const user of allUsers) {
      if (!user.email) {
        console.warn(`⚠️ Skipping user ${user.userid} — missing email.`);
        continue;
      }

      let shouldSave = false;

      for (const todo of user.todos) {
        if (
          todo.reminderAt &&
          !todo.reminderSentemail &&
          !todo.done &&
          new Date(todo.reminderAt) <= new Date()
        ) {
          try {
            const htmlContent = `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #0f0f0f; padding: 40px 20px; color: #e5e5e5;">
    <div style="max-width: 600px; margin: auto; background-color: #1a1a1a; border-radius: 14px; overflow: hidden; box-shadow: 0 0 14px rgba(0,0,0,0.6); border: 1px solid #2c2c2c;">
      <div style="text-align: center; padding: 30px 20px;">
        <img src="https://to-do-list-ai.vercel.app/to-do-list.gif" alt="Contest Tracker" style="width: 160px; margin-bottom: 25px;" />

        <h1 style="font-size: 24px; margin-bottom: 8px; color: #90cdf4;">⏰ Task Reminder</h1>
        <p style="font-size: 16px; color: #aaa;">You have a task due — don’t let it slip away.</p>

        <div style="margin-top: 30px; background: linear-gradient(135deg, #232323, #1c1c1c); border: 1px solid #333; padding: 24px; border-radius: 12px;">
          <p style="font-size: 18px; margin: 0 0 12px 0; font-weight: 600; color: #ffffff;">📝 ${todo.text}</p>
          <p style="font-size: 15px; color: #bbbbbb;"><strong>📅 Due:</strong> ${new Date(todo.reminderAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })} IST</p>
          <p style="font-size: 15px; color: #ff6b6b;"><strong>🚨 Status:</strong> Pending</p>
        </div>

        <div style="margin-top: 24px;">
          <a href="https://to-do-list-ai.vercel.app/" target="_blank"
            style="display: inline-block; padding: 12px 24px; background-color: #34a853; color: white; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
            ✅ Mark as Done
          </a>
        </div>

        <p style="font-size: 13px; color: #666; margin-top: 32px;">Sent by <a href="https://to-do-list-ai.vercel.app/" style="color: #4f46e5; text-decoration: none;">To-Do List</a> • Stay productive, always.</p>
      </div>
    </div>
  </div>
`;




            await transporter.sendMail({
              from: process.env.GMAIL_USER,
              to: user.email,
              subject: `⏰ Reminder: Task "${todo.text}" is due`,
              html: htmlContent,
            });

            todo.reminderSentemail = true;
            shouldSave = true;
            sentCount++;
          } catch (err) {
            console.error('❌ Email send failed:', err);
            return NextResponse.json(
              { success: false, error: 'email_send_failed', details: err.message },
              { status: 500 }
            );
          }
        }
      }

      if (shouldSave) {
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${sentCount} email reminders`,
    });
  } catch (error) {
    console.error('❌ Email reminder error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
