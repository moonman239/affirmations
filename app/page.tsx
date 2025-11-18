"use client";
import Image from "next/image";
import { AffirmationComponent } from "./AffirmationComponent";
import dailyAffirmation from "./affirmation";
import { useState } from "react";
import moment, { Moment } from "moment";

async function scheduleNotifications(startingMoment:Moment)
{
  try
  {
    console.log(`starting notification at ${startingMoment}`)
    const diff = startingMoment.diff(moment(),"milliseconds");
    const result = await Notification.requestPermission();
    if (result === "granted")
    {
      // schedule notifications for every 24 hours starting on startDate
      const notify = async ()=>{
        const currentDate = new Date();
        const notification = new Notification(dailyAffirmation(currentDate));
        notification.onshow = (e)=>console.log(`showed notification: ${notification.title}`);
      }
      setTimeout(()=>{
        notify();
        setInterval(notify,8.64e+7)
      },diff);
    }
  }
  catch (e)
  {
    alert("Could not do notifications.");
    console.error(e);
  }
}

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
      (event)=>{
        event.preventDefault();
        if (selectedMoment !== null)
          scheduleNotifications(selectedMoment);
        else
          alert("Please select a time to start with.");
      }
    }>
      Notify me every day at this time: <br/>
      <input type="time" onChange={(event)=>{
        if (event.target.value)
        {
          const currentMoment = moment();
          console.log(`time value: ${event.target.value}`);
          const selectedTime = moment(event.target.value,"HH:mm");
          /*
          With MomentJS, any time-only value absolutely must have a format,
          otherwise Moment treats it as an invalid date 
          and everything downstream (like diff()) breaks. */
          if (selectedTime.isBefore(currentMoment))
            // user wants to be notified tomorrow, not today
            selectedTime.add(1,"day");
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
