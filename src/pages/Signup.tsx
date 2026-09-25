import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole, type Role } from "../app/context/RoleContext";
import { InvestorIcon, TenantIcon } from "../components/icons";

// A real-looking two-step create-account flow, matching the reference
// screenshots Véta sent. Nothing here is actually persisted anywhere - step
// 2 finishing calls the same login() used everywhere else in the demo - but
// it now looks like signing up for a real product instead of just clicking
// a role card. Corporate deliberately isn't a role choice here: per Véta,
// companies don't "sign up" for an account, they go to /corporate and talk
// to the team instead.

type Step = "account" | "role";

const roleOptions: { role: Role; title: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: "investor", title: "Investor", description: "Buy-to-let & investment", icon: InvestorIcon },
  { role: "tenant", title: "Tenant", description: "Find rental accommodation", icon: TenantIcon },
];

function StepDot({ state, label }: { state: "done" | "current" | "upcoming"; label: string }) {
  return (
    <span className="flex items-center gap-2">
      {/* Blue was reading as near-black in a small screenshot - gold is
          Buynidify's other brand colour and actually reads as colour at
          this size, so the step indicator leans on that instead. */}
      <span
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-sm ${
          state === "done"
            ? "border-transparent bg-emerald-500 text-white"
            : state === "current"
              ? "border-transparent bg-gradient-to-br from-brand-gold to-amber-500 text-brand-ink ring-4 ring-brand-gold/25"
              : "border-brand-gold/40 bg-brand-gold/10 text-brand-gold-dark"
        }`}
      >
        {state === "done" ? (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M7.6 13.4 4 9.8l1.2-1.2 2.4 2.4 6.8-6.8L15.6 5.4z" />
          </svg>
        ) : (
          label === "1" ? "1" : "2"
        )}
      </span>
      <span className={`text-sm ${state === "upcoming" ? "text-brand-muted" : "font-semibold text-brand-ink"}`}>
        {label === "1" ? "Account" : "Your role"}
      </span>
    </span>
  );
}

export default function Signup() {
  const { login } = useRole();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("account");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [role, setRole] = useState<Role | null>(null);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [company, setCompany] = useState("");

  function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setPasswordError("");
    setStep("role");
  }

  function createAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    login(role, fullName);
    navigate("/app/overview");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-surface px-6 py-16">
      <Link
        to="/"
        className="mb-8 font-wordmark text-[2.1rem] font-medium leading-none tracking-[0.015em] text-brand-blue"
      >
        Buynidify
      </Link>

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-brand-border bg-white shadow-xl shadow-brand-ink/5">
        {/* A flat white card read as a plain form with no personality -
            a thin brand gradient across the top gives it the same colour
            cue the rest of the site uses (blue -> gold) without touching
            the form itself. */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-blue via-brand-blue to-brand-gold" />
        <div className="p-8">
        {step === "account" ? (
          <>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-brand-muted">
              Join Buynidify - the UK property investment platform
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
              Almost there
            </h1>
            <p className="mt-1 text-sm text-brand-muted">
              Tell us a bit more to personalise your experience
            </p>
          </>
        )}

        <div className="mt-6 flex items-center gap-3">
          <StepDot state={step === "account" ? "current" : "done"} label="1" />
          <span className={`h-px flex-1 ${step === "role" ? "bg-brand-gold" : "bg-brand-border"}`} />
          <StepDot state={step === "role" ? "current" : "upcoming"} label="2" />
        </div>

        {step === "account" ? (
          <form onSubmit={submitAccount} className="mt-6 flex flex-col gap-4">
            <label className="block text-sm font-medium text-brand-ink">
              Full name
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
              />
            </label>
            <label className="block text-sm font-medium text-brand-ink">
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
              />
            </label>
            <label className="block text-sm font-medium text-brand-ink">
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
              />
            </label>
            <label className="block text-sm font-medium text-brand-ink">
              Confirm password
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
              />
            </label>
            {passwordError && <p className="text-xs font-medium text-red-600">{passwordError}</p>}

            <button
              type="submit"
              className="mt-1 rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-dark py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={createAccount} className="mt-6 flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-brand-ink">I am joining as</p>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((r) => {
                  const RoleIcon = r.icon;
                  const active = role === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setRole(r.role)}
                      className={`relative flex flex-col items-start overflow-hidden rounded-xl border p-4 text-left transition-all ${
                        active
                          ? r.role === "investor"
                            ? "border-brand-blue bg-brand-blue-light/60 shadow-md"
                            : "border-brand-gold bg-brand-gold/10 shadow-md"
                          : "border-brand-border bg-white hover:border-brand-blue/40"
                      }`}
                    >
                      {active && (
                        <span className={`absolute inset-x-0 top-0 h-1 ${r.role === "investor" ? "bg-brand-blue" : "bg-brand-gold"}`} />
                      )}
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          r.role === "investor" ? "bg-brand-blue text-white" : "bg-brand-gold text-brand-ink"
                        }`}
                      >
                        <RoleIcon className="h-4.5 w-4.5" />
                      </span>
                      <span className="mt-2.5 text-sm font-semibold text-brand-ink">{r.title}</span>
                      <span className="mt-0.5 text-xs text-brand-muted">{r.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block text-sm font-medium text-brand-ink">
              Phone number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 900000"
                className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
              />
            </label>

            <label className="block text-sm font-medium text-brand-ink">
              Country of residence
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 w-full cursor-pointer rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
              >
                {["United Kingdom", "Ireland", "United States", "Canada", "Australia", "Other"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-brand-ink">
              Company name (optional)
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company or leave blank"
                className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
              />
            </label>

            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("account")}
                className="flex-1 rounded-xl border border-brand-border py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-surface"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!role}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-dark py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
              >
                Create account
              </button>
            </div>
            <p className="text-center text-[11px] text-brand-muted">
              By creating an account you agree to our Terms of Service and Privacy Policy. This is a
              demo platform - no financial transactions are processed.
            </p>
          </form>
        )}

        {step === "account" && (
          <p className="mt-6 text-center text-sm text-brand-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-blue hover:underline">
              Sign in
            </Link>
          </p>
        )}
        </div>
      </div>

      <p className="mt-6 max-w-md text-center text-xs text-brand-muted">
        Moving employees for work?{" "}
        <Link to="/corporate" className="font-semibold text-brand-blue hover:underline">
          See Buynidify for companies →
        </Link>
      </p>
    </div>
  );
}
