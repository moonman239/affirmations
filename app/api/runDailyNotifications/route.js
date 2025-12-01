// app/api/runDailyNotifications/route.ts
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { firebaseAdmin } from "./firebaseAdmin";
import dailyAffirmation from "@/app/affirmation";

export async function GET() {
  // 1. Find schedules due now (per user timezone)
  const { rows } = await sql`
    SELECT id, fcm_token, user_timezone
    FROM scheduled_notifications
    WHERE is_active = TRUE
      AND DATE_PART('hour', NOW() AT TIME ZONE user_timezone) = notification_hour
      AND DATE_PART('minute', NOW() AT TIME ZONE user_timezone) = notification_minute
      AND (last_sent_at IS NULL OR last_sent_at::date < CURRENT_DATE)
  `;

  if (rows.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const messages = rows.map((row) => ({
    token: row.fcm_token,
    notification: {
      title: "Daily Affirmation",
      body: dailyAffirmation(new Date()),
    },
  }));

  await firebaseAdmin.messaging().sendEach(messages);

  const ids = rows.map((r) => Number(r.id))
  await sql`
    UPDATE scheduled_notifications
    SET last_sent_at = NOW()
    WHERE id = ANY(${ids}::bigint[])
  `;

  return NextResponse.json({ sent: messages.length });
}
