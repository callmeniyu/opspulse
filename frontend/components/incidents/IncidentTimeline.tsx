interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time: string;
}

const demoEvents: TimelineItem[] = [
  {
    id: "1",
    title: "Incident created",
    description: "Incident was opened",
    time: "14:02",
  },
  {
    id: "2",
    title: "Investigation started",
    description: "Responder acknowledged the incident",
    time: "14:05",
  },
  {
    id: "3",
    title: "Responder joined",
    description: "Ravi joined the response team",
    time: "14:08",
  },
];

export function IncidentTimeline() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Timeline</h2>

        <span className="text-[10px] uppercase tracking-wider text-[#505865]">Recent activity</span>
      </div>

      <div className="relative ml-2 border-l border-[#252b35]">
        {demoEvents.map((event) => (
          <div key={event.id} className="relative pb-7 pl-7 last:pb-0">
            <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#8b9cff] ring-4 ring-[#0e1117]" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#dce0e5]">{event.title}</p>

                <p className="mt-1 text-xs text-[#68717f]">{event.description}</p>
              </div>

              <time className="shrink-0 text-xs text-[#505865]">{event.time}</time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
