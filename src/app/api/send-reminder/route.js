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
            await transporter.sendMail({
              from: process.env.GMAIL_USER,
              to: user.email,
              subject: `⏰ Reminder: Task "${todo.text}" is due`,
              text: `Hello!\n\nThis is a reminder that your task "${todo.text}" is due.\nPlease complete it soon.\n\nThanks!`,
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
