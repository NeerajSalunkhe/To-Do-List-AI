import { NextResponse } from 'next/server';
import { POST as sendRenewals } from '../renowal/route';
import { GET as sendReminders } from '../send-whatsapp-reminders/route';
import { GET as emailreminder} from '../send-reminder/route'
import { GET as emailrenowal } from '../send-renowal/route'
export const config = {
  schedule: '30 0 * * *', 
};

export async function GET() {
  await sendRenewals(); 
  await emailreminder();
  await emailrenowal();
  return await sendReminders(); 
}
