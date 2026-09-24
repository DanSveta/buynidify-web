// Two more trimmed slices from the Relocate AI brief: a documents checklist
// (per visa purpose, plus the rental-side documents Buynidify itself asks
// for) and a local-services directory (bank, NI number, GP, SIM, school).
// Both are static reference content, same spirit as VISA_INFO in
// relocateAIEngine.ts - directionally correct for a demo, not a live feed.

import type { Purpose } from "./relocateHomes";

export type ChecklistItem = { label: string; note: string };

const VISA_DOCS: Record<Purpose, ChecklistItem[]> = {
  work: [
    { label: "Valid passport", note: "With at least six months left before expiry" },
    { label: "Certificate of sponsorship", note: "Issued by your UK employer" },
    { label: "Proof of qualifications", note: "For roles that require a specific qualification" },
    { label: "Proof of funds", note: "Bank statements showing you can support yourself initially" },
  ],
  study: [
    { label: "Valid passport", note: "With at least six months left before expiry" },
    { label: "CAS", note: "Confirmation of acceptance for studies from your university" },
    { label: "Proof of funds", note: "Covering tuition and living costs for the first year" },
    { label: "English-language test", note: "If your course or nationality requires one" },
  ],
  family: [
    { label: "Valid passport", note: "With at least six months left before expiry" },
    { label: "Relationship evidence", note: "Marriage/partnership proof, or evidence of the family relationship" },
    { label: "Proof of income", note: "Meeting the minimum income threshold, from either partner or savings" },
    { label: "Accommodation evidence", note: "Showing where you'll live once you arrive" },
  ],
  eu: [
    { label: "Valid passport or national ID", note: "EU, EEA or Swiss" },
    { label: "Proof of UK residence before the cutoff", note: "For EU Settlement Scheme status" },
    { label: "Proof of continuous residence", note: "If applying for settled rather than pre-settled status" },
  ],
  other: [
    { label: "Valid passport", note: "With at least six months left before expiry" },
    { label: "Evidence for your specific route", note: "Varies - Global Talent, High Potential Individual, Youth Mobility, etc." },
    { label: "Proof of funds", note: "Most routes expect some evidence you can support yourself" },
  ],
};

const RENTAL_DOCS: ChecklistItem[] = [
  { label: "Photo ID", note: "Passport, ID card or driving licence" },
  { label: "Proof of income or savings", note: "Recent payslips, an employment letter, or bank statements" },
  { label: "References", note: "A previous landlord or employer reference, where you have one" },
  { label: "UK right-to-rent check", note: "Buynidify verifies this once you're matched with a landlord" },
];

export function documentsFor(purpose: Purpose | null): { visa: ChecklistItem[]; rental: ChecklistItem[] } {
  return { visa: VISA_DOCS[purpose ?? "other"], rental: RENTAL_DOCS };
}

export type LocalService = { id: string; title: string; blurb: string; askPrompt: string };

export const LOCAL_SERVICES: LocalService[] = [
  {
    id: "bank",
    title: "Bank account",
    blurb: "Open one once you have a UK address - some banks let you start the process before you land.",
    askPrompt: "How do I open a UK bank account before or after I arrive?",
  },
  {
    id: "ni",
    title: "National Insurance number",
    blurb: "Needed to work and pay tax - apply once you're in the UK with your right to work confirmed.",
    askPrompt: "How and when do I apply for a National Insurance number?",
  },
  {
    id: "gp",
    title: "GP registration",
    blurb: "Register with a local doctor as soon as you have a fixed address, not just when you need care.",
    askPrompt: "How do I register with a GP once I have a UK address?",
  },
  {
    id: "sim",
    title: "SIM & broadband",
    blurb: "A UK phone number makes the rest of this list easier - monthly SIM-only plans are the simplest start.",
    askPrompt: "What's the easiest way to get a UK SIM card and broadband set up?",
  },
  {
    id: "school",
    title: "School registration",
    blurb: "State schools are free and allocated by catchment area, so it's worth checking before you commit to a lease.",
    askPrompt: "How does school registration work if I'm moving with children?",
  },
];
