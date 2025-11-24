import { NextRequest, NextResponse } from "next/server";
import moment from "moment";
import {sql} from "@vercel/postgres";

export type RequestJson = {
    fcmToken: string,
    time:string,
    timeZone:number
};

/*
Creates an entry in a database table, indicating when to send notifications.
*/
export async function POST(request:NextRequest)
{
  try {
    const {fcmToken,time,timeZone}: RequestJson= await request.json();
    const timeMoment = moment(time);
    if (fcmToken && time && timeZone)
    {
      await sql`
      INSERT INTO scheduled_notifications (
        fcm_token,
        notification_hour,
        notification_minute,
        user_timezone
      )
      VALUES (${fcmToken}, ${timeMoment.hour()}, ${timeMoment.minute()}, ${timeZone});
    `;
    return new NextResponse(JSON.stringify({message:"success"}));
    }
    else
      return new NextResponse(JSON.stringify({message:"missing field(s)"}),{status:400});
  }
  catch (e)
  {
    console.error(`error in scheduleNotifications: ${e}`);
    return new NextResponse(JSON.stringify({message: "no success"}),{status:500});
  }
}