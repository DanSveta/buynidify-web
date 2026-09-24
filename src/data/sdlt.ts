// England & Northern Ireland Stamp Duty Land Tax - real published bands, not
// a fabricated figure, so the "purchase cost breakdown" the AI analysis
// shows is an honest calculation someone could check against gov.uk, not
// invented set dressing.
//
// Bands current from 1 April 2025 (standard nil-rate threshold back to
// £125,000): 0% to £125k, 2% to £250k, 5% to £925k, 10% to £1.5m, 12% above.
// The additional-property surcharge (second homes/buy-to-let) is a flat 5%
// on the WHOLE price on top of the standard bands (raised from 3% to 5% in
// the Oct 2024 budget), and a further flat 2% surcharge applies on top of
// that for a non-UK-resident buyer. Scotland and Wales use their own LBTT/
// LTT systems instead - this calculator is for England/NI only, which is
// what the disclaimer below says.

const STANDARD_BANDS: { upTo: number; rate: number }[] = [
  { upTo: 125_000, rate: 0 },
  { upTo: 250_000, rate: 0.02 },
  { upTo: 925_000, rate: 0.05 },
  { upTo: 1_500_000, rate: 0.1 },
  { upTo: Infinity, rate: 0.12 },
];

const ADDITIONAL_PROPERTY_SURCHARGE = 0.05;
const NON_RESIDENT_SURCHARGE = 0.02;

function standardSdlt(price: number): number {
  let tax = 0;
  let lower = 0;
  for (const band of STANDARD_BANDS) {
    if (price <= lower) break;
    const upper = Math.min(price, band.upTo);
    tax += (upper - lower) * band.rate;
    lower = band.upTo;
  }
  return Math.round(tax);
}

export type SdltScenario = "standard" | "additional" | "nonResident";

export const sdltScenarioLabel: Record<SdltScenario, string> = {
  standard: "Standard UK residential purchase",
  additional: "Additional residential property",
  nonResident: "Additional property, non-UK resident",
};

/** SDLT for a given scenario - England/NI rates. Standard = buying your only
 *  residential property. Additional = a second home or buy-to-let (the usual
 *  case for an investor). Non-resident stacks both surcharges. */
export function calculateSdlt(price: number, scenario: SdltScenario): number {
  const base = standardSdlt(price);
  if (scenario === "standard") return base;
  if (scenario === "additional") return Math.round(base + price * ADDITIONAL_PROPERTY_SURCHARGE);
  return Math.round(base + price * ADDITIONAL_PROPERTY_SURCHARGE + price * NON_RESIDENT_SURCHARGE);
}

export function allSdltScenarios(price: number): { scenario: SdltScenario; label: string; amount: number }[] {
  return (["standard", "additional", "nonResident"] as const).map((scenario) => ({
    scenario,
    label: sdltScenarioLabel[scenario],
    amount: calculateSdlt(price, scenario),
  }));
}
