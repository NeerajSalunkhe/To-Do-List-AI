// app/api/renewal-cron/route.js
import { POST as sendRenewals } from '../renowal/route';

export const config = {
  schedule: '*/30 * * * *', // every 30 minutes
};

export async function GET() {
  return await sendRenewals(); // ✅ okay to call POST from GET inside Vercel scheduled function
}
