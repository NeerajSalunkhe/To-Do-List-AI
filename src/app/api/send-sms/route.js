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
      const { phone, todos } = user;

      for (const todo of todos) {
        const { text, reminderAt, reminderSent, done } = todo;

        if (
          phone &&
          reminderAt &&
          !reminderSent &&
          !done &&
          new Date(reminderAt) <= new Date()
        ) {
          console.log(`📲 Sending SMS reminder to ${phone} for: "${text}"`);

          await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER, // SMS number
            to: phone,
            body: `⏰ Reminder: Your task "${text}" is due! Please complete it soon.`
          });

          todo.reminderSent = true;
          sentCount++;
        }
      }

      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${sentCount} SMS reminders`
    });
  } catch (error) {
    console.error('❌ SMS reminder error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
