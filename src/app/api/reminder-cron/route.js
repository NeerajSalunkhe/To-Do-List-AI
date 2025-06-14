// app/api/reminder-cron/route.js
import { NextResponse } from 'next/server';
import { GET as sendReminders } from '../send-whatsapp-reminders/route';

export const config = {
  schedule: '*/1 * * * *', // Runs every 1 minute on Vercel
};

export async function GET() {
  return await sendReminders(); // 🔁 Reuse your existing reminder logic
}
