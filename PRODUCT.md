# Buynidify — Product & Feature Guide

> **Document status:** Living product reference, initial draft.
>
> This document describes the product idea and feature logic currently represented in the Buynidify prototype. It is intentionally non-technical. Details marked **To define** have not yet been confirmed and should not be treated as final business rules.

## Purpose of this document

This is the shared source of truth for founders, designers, developers, and other collaborators working on Buynidify. It should explain:

- what the product is trying to achieve;
- who it serves;
- how the different participants interact;
- what each feature is meant to do;
- the journey from property discovery to a signed lease;
- what belongs in the current MVP; and
- which important product decisions are still open.

Update this document whenever a feature, workflow, role, or business rule is clarified or changed. The interface prototype may illustrate these ideas, but this document should be treated as the product reference rather than as a description of screen layouts.

## Product summary

Buynidify is a property marketplace that connects **tenants who need homes**, **investors who can acquire or provide those homes**, and **companies arranging housing for employees**.

The central concept shown in the current prototype is demand-led property investment:

1. A tenant identifies a home or describes the kind of home they want.
2. Buynidify makes that demand visible to suitable investors.
3. An investor expresses interest and may purchase the property through the appropriate legal process.
4. The tenant and investor are matched.
5. The deposit, purchase, lease, and move-in journey are coordinated through Buynidify.

In simple terms: **an investor can buy a home that a tenant already wants, reducing uncertainty for both sides.**

The broader marketing concept also presents Buynidify as a place to discover verified properties, assess investment opportunities using AI-assisted insights, manage rentals, support relocations, and potentially participate in fractional property investment. The exact relationship between direct property purchases and fractional investment is still to be defined.

## Product principles currently implied

- **Start with real demand.** Tenant interest can become a useful signal for investors instead of relying only on speculative property searches.
- **Make the journey visible.** Both sides should understand what is happening from initial interest through to a signed lease.
- **Support different participants in one ecosystem.** Investors, tenants, and companies have different needs but contribute to the same housing journey.
- **Use assistance and automation where useful.** AI is presented as a tool for property analysis, matching, relocation guidance, and support triage.
- **Keep humans available for important handoffs.** The prototype assumes a Buynidify coordinator helps manage deal progression and cases that should not be handled only by AI.
- **Build trust around property transactions.** Verified listings, legal partners, transparent stages, consent, and clear support routes are recurring parts of the product concept.

## Geographic and market scope

The product application currently assumes an **England/UK-focused initial market**, displays prices in GBP, and uses example locations including London, Manchester, Bristol, Leeds, Birmingham, Bath, and Edinburgh.

Some marketing-page content currently refers to global or US properties, USD pricing, fractional investment, LLC ownership, and worldwide relocation. These are prototype materials and are not yet reconciled with the UK-first application concept.

**To define:**

- Exact launch geography and whether Scotland is included in the first release.
- Whether Buynidify initially supports renting, whole-property investment, fractional investment, or a combination.
- When and how international relocation and markets outside the UK enter the roadmap.

## User roles

### Investor

An investor uses Buynidify to discover property opportunities, understand expected suitability or returns, see demonstrated tenant demand, acquire properties, and follow deals through to tenancy.

The current prototype gives investors access to:

- the property marketplace;
- a simulated AI property-link analyzer;
- property search and filters;
- tenant-demand opportunities;
- the deal tracker;
- premium and VIP subscriptions; and
- subscription billing.

### Tenant

A tenant uses Buynidify to find a suitable home, express interest, communicate their housing requirements, follow the match and transaction process, and manage their home after moving in.

The current prototype gives tenants access to:

- available homes in the marketplace;
- property search and filters;
- the deal tracker;
- relocation guidance; and
- lease, rent-history, and support information.

### Corporate

A corporate user represents a company or HR/people team arranging housing for employees, especially during relocation.

The intended corporate proposition includes:

- viewing employees' housing status, location, and cost in one place;
- receiving and approving employee housing requests and budgets;
- monitoring open requests and upcoming lease renewals; and
- reporting housing cost by location.

The current prototype demonstrates this proposition and a demo-request form, but not yet a complete operational company dashboard.

### Buynidify coordinator

Although there is no coordinator-facing interface in the current prototype, the product logic refers to a human coordinator who:

- handles the handoff after a tenant–investor match;
- communicates next steps during a deal;
- receives certain support and lease questions; and
- may coordinate legal, property, and service partners.

**To define:** coordinator responsibilities, internal tools, service-level expectations, and which actions are automated versus manually managed.

## Core marketplace model

The prototype currently suggests two complementary paths.

### Path A: Investor-owned or investor-listed property

1. An investor adds or lists a property on Buynidify.
2. The property becomes discoverable to tenants.
3. A tenant expresses interest.
4. If both sides wish to proceed, a match/deal is created.
5. The parties progress toward deposit, lease, and move-in.

### Path B: Tenant-led demand for a property not yet owned

1. A tenant identifies a property or submits housing requirements.
2. The demand appears to relevant investors.
3. One or more investors can express interest in buying the property.
4. Buynidify establishes a match and coordinates the acquisition.
5. The tenant secures the home and signs the lease after the purchase progresses.

Tenant-demand entries currently include the destination city, property type, target monthly rent, minimum bedrooms, number of interested tenants, age of the request, and additional requirements.

**To define:**

- What makes tenant interest sufficiently serious or verified to show investors.
- Whether a tenant selects an exact property, submits general requirements, or can do both.
- How investors are ranked or selected when several respond.
- Whether tenant demand is anonymous and what information becomes visible at each stage.
- When a binding commitment exists for either party.
- What happens if the property cannot be purchased, the investor withdraws, or the tenant changes their mind.

## Shared deal journey

The current prototype uses four visible stages:

1. **Matched** — the tenant and investor have both expressed interest.
2. **Deposit Paid** — the tenant pays a holding deposit to secure the home.
3. **Purchase In Progress** — the investor purchases the property through legal partners.
4. **Lease Signed** — the rental agreement is signed, the deposit is converted, and the deal is considered closed.

The Deal Tracker is intended to show the same underlying progress to the tenant and investor. A Buynidify coordinator currently handles the handoff between stages. Future in-app messaging is expected to fit into this journey.

**To define:**

- Exact deal stages, status transitions, owners, deadlines, and required documents.
- The meaning and legal treatment of the holding deposit and what “deposit converted” means.
- Cancellation, refund, fallback, dispute, and failed-purchase rules.
- Conveyancing, referencing, Right to Rent, KYC/AML, tenancy-deposit protection, and lease-signing responsibilities.
- What each role can see and do during every stage.

## Feature guide

### Scenario selection and access

The prototype uses a simple scenario picker rather than real authentication. A visitor chooses Investor, Tenant, or Corporate and sees the corresponding experience. They may log out and choose another role.

This is only a demonstration device. Real account structure, permissions, onboarding, verification, and the possibility of one person holding multiple roles are not yet defined.

### Marketplace

The Marketplace is the main view of properties currently active in the Buynidify ecosystem.

For investors, it currently shows investor-listed properties and offers a link field for a property found on portals such as Rightmove, Zoopla, or OnTheMarket. The intended feature is to analyze an external listing and provide an AI-assisted assessment. The present result is simulated.

For tenants, it presents homes framed as available to rent and allows the tenant to express interest.

**To define:** listing sources, listing ownership, moderation, availability rules, analysis inputs and outputs, rent calculation, property-detail content, and actions after interest is expressed.

### Property search

Search currently represents properties for sale that an investor could buy and bring onto the platform. Users can filter by:

- minimum number of bedrooms;
- maximum purchase price;
- property type;
- furnished status;
- washing machine in the unit;
- parking; and
- whether pets are allowed.

A list and illustrative map view are available. The current map does not use a real mapping or property-data provider.

**To define:** how investor and tenant search differ, location and commute search, rental-budget filters, sorting, saved searches, alerts, property availability, and integration with external listing providers.

### AI property analysis

The intended concept allows an investor to paste an external property link and receive an assessment such as a fit score, yield analysis, or marketplace suitability signal.

The current experience only waits briefly and displays a random mock score. No external page is read and no analysis occurs.

**To define:** data sources, score methodology, financial assumptions, risk indicators, confidence and disclaimers, comparison data, report format, and whether analyzed properties are saved automatically.

### Tenant Demand

Tenant Demand is an investor-only feature in the current concept. It shows housing demand for which an investor-owned property is not yet available. An investor can indicate that they are interested in buying a suitable property.

Premium and VIP members are currently described as receiving earlier alerts when demand matches locations and price ranges they care about.

**To define:** demand validation, matching thresholds, alert timing, exclusivity, competition between investors, privacy rules, and the workflow after an investor responds.

### Deal Tracker

The Deal Tracker provides a shared view of the journey from match to signed lease. It currently displays the property, anonymized participant initials, last update, current stage, and explanations of all stages.

It is intended eventually to support in-app communication without changing the overall deal structure.

**To define:** actions, tasks, documents, payments, messages, notifications, stage ownership, audit history, and exceptional states.

### Relocation assistant

Relocate is currently a consent-first guided question-and-answer flow. It asks for the user's name, destination city, approximate monthly budget, and desired move-in date. The intended outcome is to hand these answers into Search and generate suitable housing matches.

The prototype describes the experience as AI-guided and suggests future voice input, but currently uses typed responses and does not perform a real search handoff.

**To define:** intended users, origin and destination coverage, household and employment information, affordability checks, employer involvement, voice functionality, consent/data retention, and relocation services beyond housing search.

### Corporate housing

Buynidify's corporate offering is intended to help companies manage employee relocation and housing. The proposed experience includes a single dashboard, employee requests and budget approvals, housing-status visibility, costs by location, renewals, and open-request reporting.

The current prototype contains only an overview and a demo-request form requesting company name, work email, and approximate employee volume.

**To define:** company onboarding, employee invitations, roles and permissions, approval policies, billing, reporting, privacy between employer and employee, bulk requests, and service delivery.

### Premium and VIP memberships

The prototype currently presents three investor plans:

- **Standard — £0/month:** property search, AI scoring, and yield calculator.
- **Premium — £49/month:** Standard features plus early tenant-demand access and priority AI analysis.
- **VIP — £149/month:** Premium features plus a dedicated account manager and reduced transaction fees.

These prices and benefits are mock product content and should not be considered approved commercial terms.

**To define:** final pricing, tax, billing frequency, trials, cancellation, feature entitlements, alert advantage, transaction fees, fair-access rules, and whether tenants or companies have paid plans.

### Billing

The investor billing concept shows the active plan, status, renewal date, recurring amount, and payment card. Subscription upgrades and card updates are not currently functional.

**To define:** payment provider, supported payment methods, invoices, taxes, failed payments, refunds, cancellation, plan changes, and transaction-related payments.

### My Home

After move-in, a tenant can view basic lease details and rent-payment history. The prototype includes property address, monthly rent, lease term, renewal date, and previous payments.

**To define:** complete tenancy information, documents, rent payment actions, receipts, renewal workflow, household members, inspections, notices, and move-out.

### Tenant support

Tenants can categorize and submit a support request. The categories currently route as follows:

- Maintenance and repairs → AI triage, followed by a local service partner if necessary.
- Rent and payments → billing support.
- Lease questions → a Buynidify coordinator.
- Moving and access → AI triage.
- Other issues → a Buynidify coordinator.

**To define:** urgency and emergency handling, service levels, landlord/investor involvement, contractor selection, status tracking, communications, costs and approvals, escalation, and feedback after resolution.

### Verified listings and trust

The marketing experience promises verified listings, predictive analytics, secure legal transactions, and priority support. It also refers to property inspections, escrow, legal ownership structures, digital contracts, and vetted tenants.

These claims are not backed by operational functionality in the current prototype and require product, legal, and compliance definition before being presented as firm promises.

### Fractional investment

The marketing content describes fractional property participation, low minimum investment amounts, ownership through a legal structure, a digital ledger, and rental payouts.

The application itself currently behaves more like a marketplace for an investor buying a whole property for an identified tenant. Fractional investment is therefore a concept in the marketing layer, not a defined end-to-end workflow.

**To define:** whether fractional investment is part of the launch product, ownership structure, investor rights, minimum investment, distributions, fees, liquidity, governance, regulation, risk disclosures, and how it connects to tenant-led demand.

## Current MVP boundary represented by the prototype

The current prototype demonstrates:

- three participant scenarios: Investor, Tenant, and Corporate;
- a property marketplace;
- basic property filtering and map presentation;
- simulated AI analysis of an external property;
- tenant-demand signals for investors;
- a shared four-stage deal tracker;
- a guided relocation intake;
- a corporate housing proposition and sales enquiry;
- investor membership plans and billing presentation; and
- tenant lease, rent-history, and support presentation.

The prototype does **not** yet provide:

- real user accounts or permissions;
- a backend or persistent product data;
- real property listings or live availability;
- real AI analysis or matching;
- real maps;
- messaging between participants;
- deposits, rent, subscriptions, or other payments;
- document generation or electronic signatures;
- legal/compliance processes such as KYC/AML or Right to Rent;
- real company dashboards and employee workflows;
- real service-provider or coordinator tools; or
- a defined fractional-investment transaction journey.

## Key product decisions still required

The following questions should be resolved as role-specific requirements are added:

1. What is the exact launch proposition: tenant-led buy-to-let matching, a broader rental marketplace, fractional investment, or all three?
2. What is the primary end-to-end journey for each role?
3. What information must users provide, and when are identity, affordability, ownership, or company checks required?
4. What creates a match, and who has the right to accept or reject it?
5. What commitments, payments, refunds, and protections apply at every deal stage?
6. How does Buynidify make money: subscriptions, transaction fees, rent-related fees, corporate contracts, investment fees, or another model?
7. What does Buynidify manage directly, and what is handled by landlords, legal partners, property managers, payment providers, or employers?
8. Which AI features provide recommendations versus make decisions, and how are their outputs explained and reviewed?
9. What information is shared between tenant, investor, company, and coordinator at each point?
10. Which marketing claims are approved, supportable, and appropriate for the launch market?

## Maintaining this guide

When defining a role or feature, document at least:

- the user's goal;
- entry conditions;
- the normal step-by-step journey;
- information collected and displayed;
- decisions and business rules;
- notifications and communications;
- payments or commercial rules;
- privacy, legal, and permission requirements;
- failure, cancellation, and exception cases;
- what is included in the MVP; and
- future ideas that are explicitly outside the MVP.

Confirmed requirements should replace the relevant **To define** items rather than simply being added alongside them. This keeps the guide clear and prevents old assumptions from surviving after a decision has been made.
