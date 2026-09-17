# Buynidify — Product & Feature Guide

> **Document status:** Living product reference — investor and tenant core flow documented; relocation and corporate flows pending.
>
> **Audience:** Founders, product managers, designers, developers, operations, agents, and future collaborators.
>
> **Rule:** This document describes the intended product, not merely what the current prototype happens to show. Anything marked **To confirm** is not yet a final business rule.

## 1. Purpose of this document

This is the shared source of truth for understanding Buynidify as a product. It explains:

- the problem Buynidify solves;
- what the platform is and is not;
- how investors and tenants use it;
- how interest becomes a match;
- how the deposit protects both sides;
- what happens during purchase and tenancy setup;
- how Buynidify earns revenue; and
- which areas still need product, operational, financial, or legal definition.

This document should be updated whenever a role, workflow, business rule, fee, or responsibility changes. Screens and prototypes should follow this guide; they should not silently become the source of product policy.

## 2. Product in one sentence

**Buynidify helps an investor validate real tenant demand before buying a UK property, and helps a tenant secure an investor for a for-sale home they want to rent.**

## 3. The problem

### Investor problem

A property investor can find an attractive property for sale, but may not know:

- whether tenants actually want that specific property;
- what rent the property may realistically achieve;
- how quickly it may let;
- what the estimated yield could be;
- what kind of tenant is likely to want it; or
- whether purchasing it is a sensible rental investment.

This creates vacancy and return risk. The investor may spend significant money buying an asset before knowing whether there is meaningful rental demand.

### Tenant problem

A tenant may find an ideal home on a UK property portal, but the home is for sale rather than for rent. The tenant cannot rent it directly, even though they would be willing to commit to a tenancy if an investor purchased it.

Traditional property search treats “for sale” and “to rent” as separate markets. Buynidify connects them.

## 4. What Buynidify is

Buynidify is a **demand-validation, matching, and transaction-coordination platform** built around properties advertised for sale on external UK property portals.

It creates a coordinated path between:

- an **investor**, who may buy a property;
- a **tenant**, who wants to rent that property;
- **Buynidify agents/coordinators**, who support the parties after a match; and
- the external legal, payment, verification, and property professionals needed to complete the purchase and tenancy.

The platform supports two equally important starting points:

1. An investor finds a property and tests whether tenants want it before purchasing.
2. A tenant finds a for-sale property and asks the investor community to purchase it for them to rent.

## 5. What Buynidify is not

Buynidify is **not a conventional property-listing portal** and does not maintain its own independent inventory of properties for sale or rent.

- Properties originate on supported third-party UK property portals.
- Buynidify only works with properties advertised **for sale** for this core flow.
- Buynidify does not search ordinary rental listings for this matching model.
- A property shown inside Buynidify is a referenced opportunity imported from an external source, not a claim that Buynidify owns or directly lists it.
- Publishing a property on Buynidify means publishing an investor or tenant's interest in that external for-sale property to the opposite side of the marketplace.

This distinction must be clear in product language, design, data modelling, and user expectations.

## 6. Initial market and property sources

The initial product is UK-only. Property opportunities are pulled or imported from supported UK property portals.

Currently confirmed examples:

- Rightmove
- Zoopla

The complete supported-source list will be added from the forthcoming reference screenshot.

Users may discover a property in either of two ways:

- Search from within Buynidify using data from supported external sources.
- Search elsewhere, copy the external property URL, and paste it into Buynidify.

Regardless of discovery method, the property must be a **for-sale** listing.

**To confirm:**

- Complete supported portal list.
- Whether each source is connected through an API, licensed feed, partnership, link metadata, or another permitted method.
- Coverage across England, Scotland, Wales, and Northern Ireland.
- Rules for unsupported, expired, removed, sold, under-offer, auction, shared-ownership, and new-build listings.

## 7. Core product principles

### Validate demand before acquisition

The investor should be able to test real tenant interest before committing to buy.

### Unlock for-sale homes for tenants

A tenant should be able to signal, “I would rent this home if an investor buys it,” even though it is not currently offered for rent.

### Interest is exploratory; deposit is commitment

Clicking “interested” helps the two sides discover each other. A tenant deposit is the later commitment mechanism that makes the matched transaction credible.

### Protect both sides with clear rules

The deposit should discourage a tenant from withdrawing after an investor has acted, while protecting the tenant if the investor fails to proceed.

### Combine automation with human coordination

AI helps evaluate opportunities. Buynidify agents help both parties navigate the agreement, purchase, tenancy contract, and related next steps.

### Show one shared version of progress

After a match, both investor and tenant should see the status, responsibilities, deadlines, documents, and next action.

## 8. Roles at a glance

| Role | Primary goal | What they contribute | How they pay |
|---|---|---|---|
| Investor | Buy a property with demonstrated rental demand | Purchase capital, proposed rental terms, and commitment to buy | Monthly subscription; platform share of rent/revenue model described below |
| Tenant | Secure a desired for-sale home as a rental | Rental demand, tenancy commitment, and deposit | No monthly subscription; one-time fixed fee when an agreement is signed |
| Buynidify agent/coordinator | Move a match safely through purchase and tenancy | Guidance, coordination, documents, communication, and partner handoffs | Internal platform role |
| Corporate | Arrange and manage employee housing | Employer requirements, approvals, and employee demand | **To define in corporate-flow section** |

## 9. Investor role

### 9.1 Investor objective

The investor wants to understand whether a for-sale property is likely to work as a rental investment and whether real tenants are prepared to rent it before the investor completes the purchase.

### 9.2 Investor journey — investor finds the property

#### Step 1: Find a for-sale property

The investor searches using criteria such as:

- city or location;
- purchase price; and
- property type, such as flat/apartment or house.

They may search inside Buynidify or on a supported external portal. Only for-sale properties are relevant.

#### Step 2: Import the property

The investor copies the external listing URL and pastes it into Buynidify. The platform retrieves the available property information and prepares it for analysis.

**To confirm:** required fields when source data is missing, and whether the user may correct imported information.

#### Step 3: Review AI-powered investment analysis

Buynidify analyzes the property as a potential rental investment. The analysis is intended to include:

- estimated monthly rent;
- estimated gross yield;
- estimated net yield;
- location score;
- estimated time to let, for example two to four weeks;
- likely tenant profile; and
- an overall explanation of the opportunity, risks, and whether the property appears worth considering.

The analysis should support a decision; it should not guarantee financial performance or replace professional advice.

**To confirm:**

- Exact analysis fields and definitions.
- Calculation methods and included/excluded costs.
- Meaning and scoring method for “location score.”
- Meaning, evidence, and permitted use of “tenant profile.”
- How “time to let” is estimated.
- Overall recommendation format and risk disclosures.
- Data sources, update frequency, confidence levels, and regulatory wording.

#### Step 4: Configure the proposed tenancy

If the investor wants to test tenant demand, they prepare the opportunity for tenants. They specify:

- target monthly rent;
- earliest or planned availability date;
- minimum tenancy length, for example six or twelve months; and
- optional notes, requirements, or context.

The availability date will often be approximately two months in the future when the property has not yet been purchased. This is an estimate, not a guaranteed move-in date.

#### Step 5: Publish interest to tenants

The investor publishes the opportunity inside Buynidify. This does not create a new property listing owned by Buynidify. It makes the investor's proposed rental opportunity—linked to the external for-sale property—visible to tenants.

#### Step 6: Measure tenant interest

The investor waits for tenants to express interest. The purpose is to assess demand before purchasing.

The investor should eventually be able to understand:

- how many tenants are interested;
- when interest was expressed;
- whether interested tenants meet relevant requirements;
- whether any tenant is ready to proceed to commitment; and
- the status of conversations or next steps.

**To confirm:** what tenant information is visible before verification or mutual acceptance, and whether several tenants may compete for the same property.

#### Step 7: Form a match

When an investor and tenant are interested in the same property and agree on the proposed rental terms, the opportunity becomes a match. Interest alone is not the final commitment.

#### Step 8: Agreement and tenant deposit

The parties move into the commitment stage. The tenant pays a deposit and an agreement records the intended tenancy terms. The deposit demonstrates that the tenant is serious enough for the investor to begin purchasing the property.

#### Step 9: Purchase the property

After the commitment is in place, the investor starts the property-purchase process. Buynidify agents coordinate the remaining journey with both sides and relevant external professionals.

#### Step 10: Complete tenancy and receive rent

Once the purchase and tenancy requirements are complete, the tenant moves in and pays rent through the agreed platform/payment arrangement. Buynidify's rental revenue share is incorporated into the amount charged rather than presented as a separate tenant subscription.

### 9.3 Investor journey — tenant finds the property first

An investor can also discover opportunities submitted by tenants:

1. A tenant imports a for-sale property they want to rent.
2. The tenant publishes their rental interest and proposed needs.
3. Investors review this demand and the associated property.
4. An investor evaluates the property, including the AI investment analysis.
5. The investor signals willingness to purchase it.
6. Investor and tenant align on rent, availability, tenancy length, and other conditions.
7. The transaction proceeds through match, agreement, deposit, purchase, and tenancy.

## 10. Tenant role

### 10.1 Tenant objective

The tenant wants to turn a desirable UK property advertised for sale into a home they can rent, or respond to a property an investor is considering buying.

### 10.2 Tenant journey — tenant finds the property

#### Step 1: Find a for-sale home

The tenant searches inside Buynidify or on a supported external portal. Even though the tenant wants to rent, the source property must be for sale.

#### Step 2: Import the property

The tenant copies the listing URL and pastes it into Buynidify.

#### Step 3: Describe rental interest

The tenant confirms that they want to rent the property if an investor purchases it. The tenant may need to provide requirements such as:

- desired move-in date;
- acceptable monthly rent or budget;
- preferred tenancy length;
- household details; and
- notes or important conditions.

Only some of these fields are currently confirmed; the final tenant-interest form remains to be defined.

#### Step 4: Publish demand to investors

The tenant publishes their interest to the investor side of Buynidify. This is a demand signal attached to the external for-sale property—not a rental listing.

#### Step 5: Wait for investor interest

Investors can review the property and the tenant demand. One or more investors may indicate willingness to buy it.

#### Step 6: Form a match

When a tenant and investor agree to pursue the same property under compatible rental terms, they become a match.

#### Step 7: Pay the commitment deposit and sign the agreement

The tenant pays a deposit to demonstrate a genuine commitment to rent if the investor completes the purchase. The parties sign an agreement covering the intended property, rent, tenancy start, tenancy length, deposit treatment, and other required conditions.

#### Step 8: Follow purchase progress

The investor begins the purchase. The tenant follows progress and completes any checks, documents, or tenancy requirements coordinated by Buynidify agents.

#### Step 9: Sign the tenancy and move in

Once the investor owns the property and all conditions are satisfied, the formal tenancy is completed and the tenant moves in from the agreed date or an updated mutually agreed date.

#### Step 10: Pay rent and use ongoing support

The tenant pays rent through the agreed arrangement and can access tenancy information and support services.

### 10.3 Tenant journey — investor publishes first

The tenant may instead browse opportunities already published by investors:

1. The tenant sees an external for-sale property that an investor is considering.
2. The tenant reviews the proposed rent, expected availability, minimum tenancy, and notes.
3. The tenant expresses interest.
4. If both sides agree to proceed, they form a match.
5. The flow continues through agreement, deposit, purchase, tenancy signing, and move-in.

## 11. Matching logic

### 11.1 Interest

Interest is an early signal. It allows an investor and tenant to discover mutual intent around the same external property.

Interest should not by itself mean:

- the investor is legally required to purchase;
- the tenant is legally required to rent;
- the property is reserved;
- the purchase will succeed; or
- the proposed move-in date is guaranteed.

### 11.2 Match

A match exists when both sides are interested in the same property and are prepared to discuss or accept compatible proposed terms.

**To confirm:** whether the system creates a match immediately after two interest actions or only after explicit acceptance of terms.

### 11.3 Commitment

Commitment begins after the parties agree on the required terms, sign the relevant agreement, and the tenant pays the deposit. This is the point intended to give the investor sufficient confidence to start the purchase.

### 11.4 Multiple interested parties

**To confirm:**

- Whether a property may have several interested tenants and investors at once.
- Who selects the counterparty.
- Whether there is an exclusivity or reservation period.
- When other interested parties are notified that the opportunity is unavailable.
- Whether a backup match may be maintained if the primary transaction fails.

## 12. Agreement and deposit protection

The deposit is central to the model. It prevents the process from relying only on casual expressions of interest after an investor begins acting on the tenant's demand.

### 12.1 Intended purpose

The deposit:

- demonstrates that the tenant is genuinely prepared to rent;
- gives the investor confidence to begin purchasing;
- compensates the investor if the tenant withdraws without an accepted reason after committing; and
- is returned to the tenant if the transaction fails because of the investor.

### 12.2 Current outcome rules

| Outcome | Deposit treatment |
|---|---|
| Tenant withdraws after commitment without an accepted protected reason | Deposit goes to the investor |
| Investor causes the transaction not to proceed or withdraws | Deposit is returned to the tenant |
| Purchase and tenancy proceed successfully | **To confirm:** whether the deposit becomes part of the tenancy/security deposit, is credited toward another payment, or is handled separately |
| External event prevents completion and neither party is at fault | **To confirm** |
| Property fails legal, survey, mortgage, valuation, or other due diligence | **To confirm** |
| Completion or move-in is delayed | **To confirm** |

### 12.3 Agreement content

The agreement is expected to record at least:

- the referenced property;
- investor and tenant identities;
- agreed monthly rent;
- expected tenancy start or availability date;
- minimum or fixed tenancy length;
- deposit amount and custody;
- deposit release/refund conditions;
- each party's responsibilities and deadlines;
- conditions that must be satisfied before purchase or tenancy;
- cancellation and dispute rules; and
- what happens if the property cannot be purchased.

All deposit and agreement rules require legal review before production use.

## 13. Assisted purchase and tenancy process

After commitment, Buynidify agents support both parties through the remaining process. Their intended role includes:

- explaining next steps;
- keeping both sides informed;
- coordinating signatures and required documents;
- helping connect the investor with purchase/legal professionals;
- helping coordinate tenant checks and tenancy setup;
- monitoring deadlines and blockers;
- documenting status changes; and
- escalating problems or disputes.

The investor remains the property purchaser, and the tenant remains the future renter. Buynidify coordinates the journey but the exact boundary between the platform, agents, solicitors, estate agents, lenders, property managers, and payment providers is still to be defined.

## 14. Shared transaction stages

The product should show both sides the same high-level journey. A more accurate initial stage model is:

1. **Property imported** — an external for-sale property is brought into Buynidify.
2. **Opportunity published** — investor proposal or tenant demand becomes visible.
3. **Interest received** — one or more people on the opposite side respond.
4. **Matched** — investor and tenant agree to explore the same property together.
5. **Terms agreed** — proposed rent, dates, tenancy length, and conditions align.
6. **Agreement signed** — the pre-purchase/tenancy commitment is executed.
7. **Deposit secured** — the tenant's commitment deposit is received and protected according to the agreement.
8. **Purchase in progress** — the investor proceeds with acquisition and due diligence.
9. **Tenancy preparation** — checks, formal tenancy documents, payments, and move-in arrangements are completed.
10. **Lease signed / ready to move in** — the tenancy becomes ready to begin.
11. **Tenancy active** — the tenant occupies the property and ongoing rent/service processes begin.

These stages are a structured interpretation of the confirmed flow. Names, ordering, and legal triggers still require validation.

## 15. AI property analysis

AI analysis helps the investor evaluate a referenced property before publishing it or responding to tenant demand.

### Intended output

- Summary of the property and investment case.
- Estimated monthly rental value.
- Estimated gross rental yield.
- Estimated net rental yield.
- Location score.
- Estimated time to let.
- Likely tenant profile.
- Key advantages, concerns, and risks.
- A clear explanation of whether and why the opportunity may be worth further investigation.

### Required product safeguards

- Estimates must be labelled as estimates.
- The analysis must explain its assumptions.
- Users must understand that results are not guarantees.
- Stale or incomplete source data should be identified.
- Financial, legal, tax, mortgage, valuation, survey, and regulatory advice must remain appropriately separated.
- Fairness and privacy must be considered before generating or exposing any “tenant profile.”

## 16. Search and discovery

The product may offer an aggregated search experience powered by supported external property sources. The core filters currently confirmed are:

- city/location;
- purchase price; and
- property type.

All returned properties for the core matching flow must be for sale.

Additional filters visible in the prototype—bedrooms, furnishing, parking, pets, washing machine, and others—should not be treated as final requirements until confirmed.

Search should always preserve the original external listing source and make the property's current external status understandable.

## 17. Publishing an opportunity

“Publish” has a specific meaning in Buynidify:

- The underlying property remains on the external portal.
- Buynidify stores or displays a reference to it.
- The publishing user adds their own intent and proposed terms.
- The opportunity becomes visible to the opposite role.

### Investor-published opportunity

Contains the property reference plus proposed monthly rent, availability date, minimum tenancy, notes, and relevant AI analysis.

### Tenant-published demand

Contains the property reference plus the tenant's intention to rent, desired timing, budget/acceptable rent, tenancy expectations, and relevant notes.

**To confirm:** moderation, expiry, editing, removal, duplicate detection, source-status monitoring, and publication visibility.

## 18. Revenue model

### 18.1 Investor subscription

Investors pay a monthly subscription to use the platform. Tenants do not pay a monthly subscription.

**To confirm:** plans, prices, entitlements, billing period, trials, cancellation, refunds, tax, and whether access to tenant demand differs by plan.

### 18.2 Tenant agreement fee

The tenant pays a fixed one-time amount when an agreement is successfully signed. This is separate from a monthly subscription.

**To confirm:** amount, due date, refundability, tax, whether it is charged per agreement/property, and treatment when a transaction later fails.

### 18.3 Ongoing rental share

The current intended model is that approximately **5%** goes to Buynidify from the ongoing rental payment arrangement. When the investor defines the target rent, the platform adds its percentage on top to determine what the tenant pays, in a model conceptually similar to a marketplace service charge.

Example only: if the investor's target receipt were £1,000 and the platform fee were exactly 5% added on top, the tenant-facing amount would be £1,050. The exact calculation has not yet been confirmed and this example is not a final pricing rule.

**To confirm:**

- Whether 5% is final or illustrative.
- Whether it is calculated on top of investor rent or deducted from it.
- Whether the tenant sees a single all-inclusive rent or an itemized service fee.
- VAT/tax treatment.
- Payment processing fees and failed-payment rules.
- Who collects, holds, and remits rent.
- Whether regulations require a different presentation or structure.

## 19. Ongoing tenancy and support

Once the property is rented, the tenant should be able to access relevant tenancy information, payment history, and support. The investor should be able to see appropriate property, tenancy, and payment information.

The prototype currently suggests support categories for maintenance, payments, lease questions, moving/access, and other issues. Final responsibility for property management, repairs, emergencies, renewals, notices, and move-out remains to be defined.

## 20. Notifications and communication

The final system should notify users about meaningful events such as:

- new interest in a published opportunity;
- a potential or confirmed match;
- requested changes to proposed terms;
- an agreement awaiting action;
- deposit status;
- purchase milestones or delays;
- required documents or verification;
- tenancy preparation tasks; and
- move-in readiness.

**To confirm:** communication channels, messaging between parties, agent participation, response deadlines, notification preferences, and privacy rules.

## 21. Verification, compliance, and trust

The transaction may require identity, investor, affordability, Right to Rent, anti-money-laundering, ownership, payment, and other checks. Exact timing and responsibility are not yet defined.

Before launch, the product must define:

- investor eligibility and source-of-funds checks;
- tenant identity, affordability, references, and Right to Rent;
- deposit custody and protection;
- payment handling;
- agreement and tenancy-document status;
- data-sharing permissions;
- complaint and dispute resolution;
- financial-promotion and investment-language constraints; and
- which entities are regulated or act through regulated partners.

## 22. Corporate and relocation roles

Corporate housing and relocation are part of the wider Buynidify vision, but their actual flows have not yet been provided. Existing prototype screens should be treated as exploratory rather than authoritative.

These sections will be expanded after the corresponding product explanations are supplied.

## 23. Fractional investment

Older marketing and prototype content mentions fractional property investment. The confirmed investor–tenant flow described here concerns an investor purchasing a property that a matched tenant wants to rent.

Fractional investment is therefore **not currently confirmed as part of this core flow**. It must not be blended into requirements unless its ownership, regulation, funding, returns, governance, and relationship to tenant demand are defined separately.

## 24. Current prototype versus intended product

The prototype demonstrates parts of the experience but should not be mistaken for completed business logic.

### Represented in some form

- Investor, tenant, and corporate scenarios.
- External property-link importing.
- Simulated AI property analysis.
- Property search and filtering.
- Investor-published properties and tenant-published demand.
- Interest, matching, and deal-tracking concepts.
- Shortlists and saved properties.
- Profile, verification, pricing, local services, and support concepts.
- Theme and presentation experiments.

### Not yet production functionality

- Live licensed property-source integrations.
- Reliable source-listing availability/status monitoring.
- Real AI investment analysis.
- Real authentication and role permissions.
- Persistent backend records.
- Identity, affordability, KYC/AML, or Right to Rent checks.
- Legally reviewed agreements and deposit rules.
- Deposit, subscription, fee, or rent payments.
- Purchase and conveyancing integrations.
- Electronic signatures and document management.
- Agent/coordinator operational tools.
- Production notifications and messaging.
- Corporate and relocation workflows.

## 25. Confirmed decisions from the current product discussion

- The initial market is the UK.
- Buynidify does not hold its own ordinary property inventory.
- Properties originate from supported external property portals.
- The core flow uses for-sale properties, not rental listings.
- Both investors and tenants can discover and import a property URL.
- An investor can test tenant interest before buying.
- A tenant can request an investor for a for-sale home they want to rent.
- AI analysis supports the investor's evaluation.
- Investors publish target rent, expected availability, minimum tenancy, and notes.
- Mutual intent leads to a match and agreement process.
- The tenant deposit represents real commitment.
- Tenant-caused withdrawal after commitment is intended to release the deposit to the investor.
- Investor-caused failure is intended to return the deposit to the tenant.
- Buynidify agents assist both sides through contracts and completion.
- Investors pay a monthly subscription.
- Tenants do not pay a monthly subscription.
- Tenants pay a fixed fee when an agreement is signed.
- The intended ongoing revenue model currently references an approximately 5% rental share/markup.

## 26. Highest-priority open decisions

1. Complete list of supported property portals.
2. Exact definition and legal trigger for interest, match, commitment, and reservation.
3. Tenant-interest form and investor-publication fields.
4. Tenant/investor verification and eligibility requirements.
5. Deposit amount, custody, protection, successful-completion treatment, and full refund/forfeiture matrix.
6. What happens if purchase fails for reasons outside either party's control.
7. Exact pre-purchase agreement and final tenancy contract structure.
8. AI analysis formulas, sources, explanations, and disclaimers.
9. Final investor subscription plans and pricing.
10. Final tenant agreement fee.
11. Final ongoing rental-fee percentage, calculation, and presentation.
12. Who collects rent and who manages the property after move-in.
13. Multi-investor/multi-tenant selection and exclusivity rules.
14. Communication, notifications, deadlines, and agent responsibilities.
15. Relocation flow.
16. Corporate flow.

## 27. How to extend this document

For every newly explained role or feature, add:

- user goal;
- entry conditions;
- normal step-by-step journey;
- information entered and displayed;
- business rules and decision points;
- permissions and privacy;
- payments and fees;
- notifications and human handoffs;
- cancellation, failure, and exception paths;
- legal/compliance dependencies;
- MVP scope; and
- explicitly deferred future functionality.

When a decision becomes confirmed, replace the relevant **To confirm** text. Do not leave old assumptions beside new rules, because that creates multiple conflicting versions of the product.
