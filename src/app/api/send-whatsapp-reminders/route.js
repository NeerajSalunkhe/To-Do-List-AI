// app/api/send-whatsapp-reminders/route.js
import { NextResponse } from 'next/server';
import twilio from 'twilio';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function GET() {
  await DbConnect();

  try {
    const allUsers = await Todo.find({});
    let sentCount = 0;

    for (const user of allUsers) {
      if (!user.phone) {
        console.warn(`⚠️ Skipping user ${user.userid} — missing phone.`);
        continue;
      }

      let shouldSave = false;

      for (const todo of user.todos) {
        if (
          todo.reminderAt &&
          !todo.reminderSent &&
          !todo.done &&
          new Date(todo.reminderAt) <= new Date()
        ) {
          try {
            await client.messages.create({
              from: process.env.TWILIO_WHATSAPP_NUMBER,
              to: `whatsapp:${user.phone}`,
              body: `⏰ Reminder: Your task "${todo.text}" is due! Please complete it soon.`,
            });
            todo.reminderSent = true;
            shouldSave = true;
            sentCount++;
          } catch (err) {
            console.error('❌ WhatsApp message send failed:', err);
            if (err.code === 63038) {
              return NextResponse.json(
                { success: false, error: 'daily_limit_exceeded' },
                { status: 429 }
              );
            }

            return NextResponse.json(
              { success: false, error: 'whatsapp_send_failed', details: err.message },
              { status: 500 }
            );
          }
          todo.reminderSent = true;
          shouldSave = true;
          sentCount++;
        }
      }

      if (shouldSave) {
        await user.save(); // This will now succeed because user.phone is intact
      }
    }
    return NextResponse.json({
      success: true,
      message: `Processed ${sentCount} WhatsApp reminders`
    });
  } catch (error) {
    console.error('❌ WhatsApp reminder error:', error);
    return NextResponse.json({ success: false, error: error.message + 'heelo' });
  }
}
