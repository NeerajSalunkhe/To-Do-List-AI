import { NextResponse } from 'next/server';
import { GET as sendReminders } from '../send-whatsapp-reminders/route';
import { POST as sendRenewals } from '../renowal/route';

export const config = {
  schedule: '0 17 * * *', // 10:30 PM
};

export async function GET() {
  await sendReminders(); // 🔁 First call reminders
  return await sendRenewals(); // Then send renewals
}
