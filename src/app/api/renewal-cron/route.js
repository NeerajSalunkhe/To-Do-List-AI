import { NextResponse } from 'next/server';
import { GET as sendReminders } from '../send-whatsapp-reminders/route';
import { POST as sendRenewals } from '../renowal/route';
import { GET as emailreminder } from '../send-reminder/route'
import { GET as emailrenowal } from '../send-renowal/route'

export const config = {
  schedule: '0 17 * * *', // 10:30 PM
};

export async function GET() {
  try {
    await fetch('http://13.51.172.209/api/master-cron');
    await sendReminders();
    await emailreminder();
    await emailrenowal();
    return await sendRenewals();
  } catch (err) {
    console.error("🔥 master-cron error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

