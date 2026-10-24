// Marks demo content (isSample from the API), so it is never mistaken for the hall's own.
export function SampleBadge({ show = false }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="chip chip-lavender sample-badge" title="Sample content for demonstrating HallMate">
      Sample
    </span>
  );
}
