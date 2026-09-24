import { useState } from "react";
import { useListings, type InterestedTenant } from "../context/ListingsContext";
import { profileFromInterestedTenant } from "../utils/profiles";
import { useAuthGate } from "../context/AuthGateContext";
import { checkForOffPlatformContact } from "../utils/contactFilter";
import { avatarFor } from "../utils/avatars";
import Avatar from "./Avatar";

// Opened from an interested-tenant row. Shows who they are and lets the
// investor start a conversation without leaving the page - the message lands
// in the shared Messages inbox.
export default function TenantProfileModal({
  tenant,
  context,
  propertyId,
  onClose,
}: {
  tenant: InterestedTenant;
  context: string;
  /** So this uses the SAME thread id the rest of the app uses for this
   *  property (`investor-${propertyId}`), instead of a one-off thread keyed
   *  on the tenant's own id. Two different ids for the same conversation is
   *  how it used to fork into two separate threads that told different
   *  stories about the same deal. */
  propertyId: string;
  onClose: () => void;
}) {
  const { sendMessage, threadFor } = useListings();
  const { requireAccount } = useAuthGate();
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [blockedReasons, setBlockedReasons] = useState<string[] | null>(null);
  const threadId = `investor-${propertyId}`;
  const thread = threadFor(threadId);

  function send() {
    if (!body.trim()) return;
    const check = checkForOffPlatformContact(body);
    if (check.blocked) {
      setBlockedReasons(check.reasons);
      return;
    }
    setBlockedReasons(null);
    requireAccount({
      title: "Message this tenant",
      message:
        "Messages go through Buynidify, so both sides know who they're talking to. Create an account to send it.",
      action: deliver,
    });
  }

  function deliver() {
    // Carry the tenant's real details onto the thread so the Messages page
    // can show their profile beside the conversation. When the interested
    // tenant is your own tenant persona, this is a self-dealing thread -
    // visible from (and correctly named from) either side.
    sendMessage(
      {
        id: threadId,
        name: tenant.name,
        context,
        profile: profileFromInterestedTenant(tenant),
        audience: tenant.isYou ? undefined : "investor",
        selfDealing: !!tenant.isYou,
      },
      body
    );
    setBody("");
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={tenant.name} initials={tenant.initials} photoUrl={avatarFor(tenant.name)} size="md" />
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">{tenant.name}</h3>
              <p className="text-xs text-brand-muted">{tenant.occupation}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-brand-muted hover:text-brand-ink">
            ✕
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2">
          {[
            ["Household", tenant.household],
            ["Moving from", tenant.movingFrom],
            ["Referencing", tenant.referencing],
            ["Interested", tenant.daysAgo === 0 ? "Today" : `${tenant.daysAgo} days ago`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-brand-surface px-3 py-2">
              <dt className="text-[10px] uppercase tracking-wide text-brand-muted">{label}</dt>
              <dd className="text-sm font-semibold text-brand-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs text-brand-muted">Interested in {context}</p>

        {thread && thread.messages.length > 0 && (
          <div className="mt-3 max-h-32 overflow-y-auto rounded-lg bg-brand-surface p-3">
            {thread.messages.map((m) => {
              const label =
                m.senderRole === "system"
                  ? "Buynidify"
                  : (m.senderRole ? m.senderRole === "investor" : m.from === "me")
                    ? "You"
                    : tenant.name;
              return (
                <p key={m.id} className="mb-1 text-xs text-brand-ink">
                  <span className="font-semibold">{label}:</span> {m.body}
                </p>
              );
            })}
          </div>
        )}

        <label className="mt-4 block text-xs font-semibold text-brand-muted">
          Message {tenant.name.split(" ")[0]}
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSent(false);
              if (blockedReasons) setBlockedReasons(null);
            }}
            rows={3}
            placeholder="Hi, thanks for your interest. Happy to answer anything about the property or the timings."
            className="mt-1 w-full resize-none rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-blue"
          />
        </label>
        {blockedReasons && (
          <p className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            Not sent - this looks like it contains {blockedReasons.join(", ")}. Contact details and
            other apps can't be shared here; keep it on Buynidify.
          </p>
        )}
        {sent && <p className="mt-1 text-xs font-medium text-emerald-700">Message sent</p>}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-surface"
          >
            Close
          </button>
          <button
            type="button"
            onClick={send}
            className="flex-1 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Send message
          </button>
        </div>
      </div>
    </div>
  );
}
