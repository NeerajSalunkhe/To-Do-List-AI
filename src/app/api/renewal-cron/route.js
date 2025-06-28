import { NextResponse } from 'next/server';
import { GET as sendReminders } from '../send-whatsapp-reminders/route';
import { POST as sendRenewals } from '../renowal/route';
import { GET as emailreminder } from '../send-reminder/route'
import { GET as emailrenowal } from '../send-renowal/route'

export const config = {
  schedule: '0 14 * * *' //7:30 pm
};

export async function GET() {
  try {
    await fetch('https://contest-tracker-pearl.vercel.app/api/master-cron');
    await sendReminders();
    await emailreminder();
    await emailrenowal();
    return await sendRenewals();
  } catch (err) {
    console.error("🔥 master-cron error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

