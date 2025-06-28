import { NextResponse } from 'next/server';
import { POST as sendRenewals } from '../renowal/route';
import { GET as sendReminders } from '../send-whatsapp-reminders/route';
import { GET as emailreminder } from '../send-reminder/route';
import { GET as emailrenowal } from '../send-renowal/route';

export const config = {
  schedule: '0 2 * * *'  // Runs every day at 7:30 AM IST
};

export async function GET() {
  try {
    // Trigger EC2 endpoint (fire and forget or await for safety)
    await fetch('https://contest-tracker-pearl.vercel.app/api/master-cron');

    // Then run Vercel-side logic
    await sendRenewals();
    await emailreminder();
    await emailrenowal();
    return await sendReminders();
  } catch (error) {
    console.error('❌ master-cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
