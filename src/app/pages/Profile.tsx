import { useRole } from "../context/RoleContext";

const roleLabel: Record<string, string> = {
  investor: "Investor",
  tenant: "Tenant",
  corporate: "Corporate",
};

export default function Profile() {
  const { role } = useRole();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Profile
      </h1>
      <p className="mt-1 text-brand-muted">
        Your account details. This is a demo scenario, not a real account, so
        nothing here is saved.
      </p>

      <div className="mt-8 max-w-lg rounded-2xl border border-brand-border bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-lg font-bold text-white">
            {role ? role[0].toUpperCase() : "?"}
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-brand-ink">
              Demo {role ? roleLabel[role] : "User"}
            </p>
            <span className="mt-1 inline-block rounded-full bg-brand-blue-light px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
              {role ? roleLabel[role] : ""}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <label className="block text-xs font-semibold text-brand-muted">
            Full name
            <input
              type="text"
              defaultValue={`Demo ${role ? roleLabel[role] : "User"}`}
              className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-blue"
            />
          </label>
          <label className="block text-xs font-semibold text-brand-muted">
            Email address
            <input
              type="email"
              defaultValue={`${role ?? "demo"}@demo.com`}
              className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-blue"
            />
          </label>
          <label className="block text-xs font-semibold text-brand-muted">
            Phone number
            <input
              type="tel"
              placeholder="+44 7xxx xxxxxx"
              className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-blue"
            />
          </label>
        </div>

        <button className="mt-6 w-full rounded-lg bg-brand-blue py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark">
          Save changes
        </button>
      </div>
    </div>
  );
}
