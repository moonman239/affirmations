"use client";
import { AffirmationComponent } from "./AffirmationComponent";
import dailyAffirmation from "./affirmation";
import { useState } from "react";
import moment, { Moment } from "moment";
import { getFcmTokenAndSchedule } from "./firebase";

export default function Home() {
  const [selectedMoment,setSelectedMoment] = useState<Moment | null>(null);
  return (
   <div className="page-wrapper">
    <header>
    <h1>Daily Affirmations</h1>
    <p>Your gentle, accessible encouragement for the day.</p>
    </header>
    <AffirmationComponent affirmation={dailyAffirmation(new Date())} />
    <form onSubmit={
      async (event)=>{
        event.preventDefault();
        const p = await Notification.requestPermission();
        if (p === "granted") // permission granted
        {
          console.info("notification permission granted");
          if (selectedMoment !== null)
            await getFcmTokenAndSchedule(selectedMoment);
          else
            alert("Please select a time to start with.");
        }
        else// permission not explicitly granted
          alert("Permission needed to send notifications.");
          
      }
    }>
      Notify me every day at this time: <br/>
      <input type="time" onChange={(event)=>{
        if (event.target.value)
        {
          const selectedTime = moment(event.target.value,"HH:mm");
          /*
          With MomentJS, any time-only value absolutely must have a format,
          otherwise Moment treats it as an invalid date 
          and everything downstream (like diff()) breaks. */
          setSelectedMoment(selectedTime);
        }
        else
          alert("Please select a valid time.");
      }}/>
      <button type="submit">
        Notify me
      </button>
    </form>
   </div>
  );
}
