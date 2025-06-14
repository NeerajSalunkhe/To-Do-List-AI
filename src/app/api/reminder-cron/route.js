import { NextResponse } from 'next/server';
import { POST as sendRenewals } from '../renowal/route';
import { GET as sendReminders } from '../send-whatsapp-reminders/route';

export const config = {
  schedule: '0 6 * * *', // 6:00 AM
};

export async function GET() {
  await sendRenewals(); 
  return await sendReminders(); 
}
