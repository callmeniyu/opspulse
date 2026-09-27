import type { IncidentMember } from "@/types/memberTypes";

export function MemberList({ members }: { members: IncidentMember[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Responders</h2>

        <span className="text-xs text-[#505865]">{members.length} members</span>
      </div>

      <div className="space-y-1">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-[#141820]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#252b35] text-xs font-semibold text-[#c5cbd3]">{member.name.slice(0, 1).toUpperCase()}</div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#dce0e5]">{member.name}</p>

              <p className="truncate text-xs text-[#68717f]">{member.email}</p>
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#68717f]">{member.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
