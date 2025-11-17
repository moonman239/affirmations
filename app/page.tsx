"use client";
import Image from "next/image";
import { AffirmationComponent } from "./AffirmationComponent";
import dailyAffirmation from "./affirmation";
import { useState } from "react";

async function scheduleNotifications(today: Date,startDate:Date)
{
  try
  {
    const result = await Notification.requestPermission();
    if (result === "granted")
    {
      // schedule notifications for every 24 hours starting on startDate
      const notify = async ()=>{
        const currentDate = new Date();
        const notification = new Notification(dailyAffirmation(currentDate));
        notification.onshow = ()=>console.log("showed notification");
      }
      setTimeout(()=>{
        notify();
        setInterval(notify,8.64e+7)
      },startDate.getTime() - today.getTime());
    }
  }
  catch (e)
  {
    alert("Could not do notifications.");
    console.error(e);
  }
}

export default function Home() {
  const [selectedDate,setSelectedDate] = useState<Date>(new Date());
  return (
   <div className="page-wrapper">
    <header>
    <h1>Daily Affirmations</h1>
    <p>Your gentle, accessible encouragement for the day.</p>
    </header>
    <AffirmationComponent affirmation={dailyAffirmation(new Date())} />
    <form onSubmit={
      (event)=>{
        event.preventDefault();
        const today = new Date();
        scheduleNotifications(today,selectedDate);
      }
    }>
      Notify me every 24 hours, starting this date and time: <br/>
      <input type="datetime-local" onChange={(event)=>{
        const date = new Date(event.target.value);
        if (date !== null)
          setSelectedDate(date);
        else
          alert("Please select a valid date");
      }}/>
      <button>
        Notify me
      </button>
    </form>
   </div>
  );
}
