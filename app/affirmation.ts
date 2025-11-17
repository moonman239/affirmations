//cycle through a list of affirmations
import affirmations from './affirmations.json' assert { type: 'json' };
export default function dailyAffirmation(date:Date)
{
    const dayNum = Math.floor(date.getTime() / 8.64e+7);
    return affirmations[dayNum % affirmations.length];
}
