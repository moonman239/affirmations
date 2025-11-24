import moment,{Moment} from "moment"
import { useState } from "react";
export function Component()
{
    const [time,setTime] = useState<Moment | null>(null);
    const today = moment();
    <div>
        <input type="time" onChange={
            (e)=>setTime(moment(e.target.value,"HH:mm"))} />
        <div>{
            time?.isBefore(today) 
            ? time.clone().add(1,'day').format("YYYY-MM-DD HH-mm")
            : time?.format("YYYY-MM-DD HH-mm")
            }</div>
    </div>
}