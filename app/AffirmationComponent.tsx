type Props = {
    affirmation:string
};
export function AffirmationComponent({affirmation}:Props)
{
    return (
        <div className="affirmation-card affirmation-current">
            <div className="affirmation-text">
                {affirmation}
            </div>
            <div className="affirmation-meta">
                Todays affirmation
            </div>
        </div>
    );
}