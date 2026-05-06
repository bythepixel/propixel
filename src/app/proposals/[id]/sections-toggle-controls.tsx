"use client";

export function SectionsToggleControls() {
  function setAll(open: boolean) {
    const details = document.querySelectorAll<HTMLDetailsElement>("[data-proposal-section]");
    details.forEach((node) => {
      node.open = open;
    });
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setAll(true)}
        className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600"
      >
        Expand all
      </button>
      <button
        type="button"
        onClick={() => setAll(false)}
        className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600"
      >
        Collapse all
      </button>
    </div>
  );
}
