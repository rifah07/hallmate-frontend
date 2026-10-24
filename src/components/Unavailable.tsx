// What a page shows when the API couldn't be reached.
export function Unavailable({ what }: { what: string }) {
  return (
    <p className="muted" role="status">
      The {what} can&apos;t be loaded right now. Please try again in a few minutes.
    </p>
  );
}
