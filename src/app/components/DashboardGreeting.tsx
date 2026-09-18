import { useRole } from "../context/RoleContext";
import { firstNameOf, greetingFor } from "../utils/greeting";

// The dashboard opens by addressing the person by name. The greeting follows
// the clock (morning / afternoon / evening) and the date is today's, so the
// page reads as "live" the moment it loads.
export default function DashboardGreeting({
  subtitle,
  action,
}: {
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { name } = useRole();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
          {greetingFor()}
          {name ? (
            <>
              , <span className="text-brand-blue">{firstNameOf(name)}</span>
            </>
          ) : null}
        </h1>
        {subtitle && <p className="mt-1 text-brand-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
