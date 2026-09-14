import { useState } from "react";
import { supportCategories } from "../data/mockData";

const rentHistory = [
  { month: "September 2026", amount: "£1,450", status: "Paid" },
  { month: "August 2026", amount: "£1,450", status: "Paid" },
  { month: "July 2026", amount: "£1,450", status: "Paid" },
];

export default function Support() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const category = supportCategories.find((c) => c.id === selectedCategory);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        My Home &amp; Support
      </h1>
      <p className="mt-1 text-brand-muted">
        Your lease, rent history, and a fast way to get help when something's
        wrong.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-border bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-brand-ink">
            Lease details
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Property</span>
              <span className="text-brand-ink">
                14 Redchurch St, Shoreditch, London
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Rent</span>
              <span className="text-brand-ink">£1,450 / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Lease term</span>
              <span className="text-brand-ink">12 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Renewal</span>
              <span className="text-brand-ink">15 March 2027</span>
            </div>
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-brand-ink">
            Rent history
          </p>
          <div className="space-y-1.5 text-sm">
            {rentHistory.map((r) => (
              <div key={r.month} className="flex justify-between">
                <span className="text-brand-muted">{r.month}</span>
                <span className="text-brand-ink">
                  {r.amount} · <span className="text-emerald-600">{r.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-brand-ink">
            Ask for help
          </p>

          {submitted ? (
            <div className="rounded-lg bg-brand-surface p-4 text-sm text-brand-ink">
              <p className="font-semibold">Request sent ✓</p>
              <p className="mt-1 text-brand-muted">
                Routed to: {category?.routedTo}. You'll hear back shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSelectedCategory(null);
                  setMessage("");
                }}
                className="mt-3 text-xs font-medium text-brand-blue hover:underline"
              >
                Send another request
              </button>
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs text-brand-muted">
                Pick a category so your request goes straight to the right
                place.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {supportCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      selectedCategory === c.id
                        ? "border-brand-blue bg-brand-blue-light"
                        : "border-brand-border hover:border-brand-blue"
                    }`}
                  >
                    <p className="font-semibold text-brand-ink">{c.label}</p>
                    <p className="text-brand-muted">{c.description}</p>
                  </button>
                ))}
              </div>

              {selectedCategory && (
                <form
                  className="mt-4 flex flex-col gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly describe what's going on..."
                    rows={3}
                    className="rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  <button
                    type="submit"
                    className="self-start rounded-lg bg-brand-ink px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                  >
                    Send request
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
