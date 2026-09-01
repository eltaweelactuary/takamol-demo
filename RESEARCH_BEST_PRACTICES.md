# Takamol MVP — Research, Best Practices, and Engineering Decisions

Last reviewed: 2026-09-01

This document records the evidence used to turn the MVP brief into implementable controls. It is an engineering readiness inventory, not legal, medical, actuarial, or regulatory advice.

## 1. Executive decisions

| Requirement area | Evidence-backed implementation decision |
|---|---|
| Product positioning | Decision-support only. No autonomous adverse underwriting or pricing decision. Every recommendation requires human review. |
| Evidence separation | Runtime demo outputs, research claims, and portfolio simulations are separate data types and separate UI sections. |
| Regulatory status | The product says “prepared for regulatory validation through the appropriate FRA Sandbox pathway,” never “FRA approved.” |
| Consent | Separate, affirmative, purpose-specific wearable consent with version, timestamp, retention placeholder, and revocation history. |
| Data minimization | The provider abstraction requests only activity fields needed by the configured biomarkers. Raw wearable streams are not persisted in this demo. |
| Authorization | Every policyholder object is checked against the authenticated role and subject identity; navigation hiding is not treated as authorization. |
| Model governance | Every score stores model ID/version, input snapshot hash, confidence, consent state, output, explanation, reviewer state, and audit event. |
| Explainability | Demo feature contributions explain the configured transparent model output. They are not causal claims and are not called medical explanations. |
| Scientific honesty | DeepSurv `0.781`, Cox `0.712`, Gini improvement `50.9%`, and ROI `40%` are displayed only as supplied research/simulation claims with limitations. The local thesis rerun did not reproduce them. |
| Demo database | Deterministic synthetic data in SQLite. The database URL is configurable so PostgreSQL can replace it without changing domain services. |
| Wearables | `WearableProvider` interface with a deterministic `MockWearableProvider`; future adapters use explicit per-data-type authorization. |
| Browser authentication | Short-lived JWT bearer tokens for the local demo, role checks on the API, Argon2 password hashing, no refresh token, and documented migration to enterprise OIDC/BFF. |

## 2. FRA and Egyptian regulatory readiness

### What the public evidence supports

The FRA operates a regulatory sandbox and publishes fintech and insurance material. Its public website also reports live testing activity. Egypt’s Law No. 5 of 2022 governs and develops the use of financial technology in non-banking financial activities. These facts support building a structured readiness pack and controlled-pilot plan; they do not prove that Takamol is eligible, accepted, licensed, or approved.

Product consequences:

1. The readiness page is a configurable evidence matrix, not a compliance certificate.
2. It covers product scope, affected consumers, consent, governance, cyber controls, explainability, model lifecycle, human oversight, audit, testing, success metrics, rollback, incidents, and pilot boundaries.
3. The proposed 5,000-policy pilot is a planning boundary from the supplied business plan, not a signed scope.
4. The application includes `not_started / draft / ready_for_review / evidence_attached` states so actual FRA requirements can be inserted later.
5. Pricing remains a prototype simulation until an insurer and the competent authority approve a controlled use case.

Sources:

- [FRA Regulatory Sandbox](https://fra.gov.eg/en/regulatory-sandbox/)
- [FRA decisions and controls page referencing Law No. 5 of 2022](https://fra.gov.eg/%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%B1%D8%A7%D8%AA-%D9%88%D8%A7%D9%84%D8%B6%D9%88%D8%A7%D8%A8%D8%B7-%D8%A7%D9%84%D9%85%D9%86%D8%B8%D9%85%D8%A9/)
- [FRA insurance sector information](https://fra.gov.eg/en/%D9%81%D9%89-%D9%85%D8%AC%D8%A7%D9%84-%D8%A7%D9%84%D8%AA%D8%A3%D9%85%D9%8A%D9%86/)

### Data protection

Law No. 151 of 2020 and its Executive Regulations issued by Decision No. 816 of 2025 are treated as design inputs. The Egyptian Personal Data Protection Center published consent guidance in January 2026 and explicitly notes that guidance does not replace the law or regulations.

Product consequences:

- Consent is affirmative, granular, versioned, and revocable.
- Purpose, requested categories, retention placeholder, controller/processor placeholders, and consequences of revocation are visible.
- Revocation stops future mock synchronization and records an audit event; it does not silently delete records that may require a lawful retention decision.
- The demo never claims automatic compliance. DPIA, legal basis analysis, controller/processor allocation, permits/licenses, cross-border transfer review, retention schedule, incident notification workflow, and Arabic legal notices remain legal-review gates.
- Health/activity-derived data is treated as sensitive even when synthetic.

Sources:

- [Egyptian PDPC Data Subject Consent Guidelines](https://pdpc.gov.eg/assets/pdf-data/Guidelines/DSConsent.pdf)
- [Egyptian PDPC data-use guidance](https://pdpc.gov.eg/assets/pdf-data/Guidelines/DU.pdf)
- [Current implementation update summarising Decision No. 816 of 2025](https://connectontech.bakermckenzie.com/egypt-important-data-protection-update/)

## 3. Insurance AI and model governance

### NIST AI RMF

The MVP maps controls to the NIST AI RMF functions: Govern, Map, Measure, and Manage. NIST describes trustworthy AI considerations including validity, safety, resilience, accountability, transparency, explainability, privacy enhancement, and managed harmful bias.

Implementation mapping:

- **Govern:** model registry, named owner, approval state, roles, audit log, limitations.
- **Map:** intended use, affected people, data provenance, exclusions, pilot boundaries.
- **Measure:** discrimination/calibration placeholders, data quality, stability, subgroup/fairness metrics, confidence.
- **Manage:** human review, rollback, incident states, inactive model switch, and go/no-go pilot decision.

Source: [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

### Insurance-specific references

The NAIC model bulletin expects a written AI systems program proportionate to risk, governance, documentation, testing/validation, fairness, accuracy, and third-party oversight. EIOPA’s 2025 opinion highlights data governance, record-keeping, fairness, cyber security, explainability, and human oversight. EIOPA also notes that life/health risk assessment and pricing can be high-risk under the EU AI Act; that is an EU classification, not an Egyptian legal conclusion, but it is a useful conservative design benchmark.

Implementation mapping:

- Model card and registry record for every model.
- Intended-use and prohibited-use fields.
- Validation status separate from active status.
- Data lineage and input snapshot hash.
- Human decision status (`pending_review`, `accepted`, `overridden`, `rejected`).
- Override reason required.
- Explanation and confidence returned with each score.
- Third-party/provider adapter inventory.
- Subgroup and calibration slots in the test plan.

Sources:

- [NAIC Model Bulletin adoption and governance summary](https://content.naic.org/article/naic-members-approve-model-bulletin-use-ai-insurers)
- [EIOPA Opinion on AI governance and risk management](https://www.eiopa.europa.eu/eiopa-publishes-opinion-ai-governance-and-risk-management-2025-08-06_sl)
- [Actuarial Standard of Practice No. 56 — Modeling](https://www.actuarialstandardsboard.org/asops/modeling-3/)

ASOP 56 is not asserted to be Egyptian law. It is used as a model-lifecycle benchmark: intended purpose, assumptions, data, implementation, validation, reliance on other experts, limitations, and communication.

## 4. Scientific evidence policy

The local technical evidence in `../thesis_rerun/outputs/THESIS_RERUN_COMPARISON.md` is the governing engineering source.

It establishes:

- A separate NHANES Study A rerun with PhenoAge/Cox outputs.
- The rerun did **not** reproduce the wearable DeepSurv `0.781`, comparator `0.712`, Gini `0.332`/`50.9%`, or ROI claim because participant-level wearable predictors, coherent labels, original artifacts, and complete pricing assumptions were unavailable.
- Discrimination and calibration must be shown together; a better C-index does not guarantee better calibration or commercial value.

Therefore:

- `DemoRiskModel` is a transparent deterministic synthetic model, not DeepSurv.
- `DeepSurvRiskModel` is an interface placeholder that fails closed until a signed artifact and metadata are supplied.
- The page `/model-performance` labels the supplied figures “Research / Simulation Result — Not Commercial Traction.”
- No API response claims that the demo model achieved `0.781`.
- The explanation service computes exact additive contributions for the transparent demo model. It is SHAP-compatible in shape and semantics, but it does not pretend that the SHAP package explained a model that is not running.

SHAP describes Shapley-based values as a way to explain model output. Feature attribution is not causal proof.

Source: [SHAP documentation](https://shap.readthedocs.io/en/latest/)

## 5. Wearable integration and privacy by design

Google Health Connect requires apps to justify each requested health data type and request only the minimum data supporting a user-facing feature. Apple describes data minimization, on-device processing, transparency/control, and security as privacy principles for health data.

Implementation mapping:

- Provider-neutral interface: authenticate, fetch activity, fetch sleep, fetch metrics, normalize, revoke.
- Mock provider only in this MVP; no external credentials.
- Scope list is explicit (`steps`, `active_minutes`, `sedentary_minutes`, `sleep_minutes`, optional heart-rate summary).
- Raw streams are normalized in provider/edge space; only daily aggregates and configured features reach the risk service.
- Missing data reduces coverage/confidence; it never automatically increases risk.
- Vendor access can be revoked independently of insurer consent.

Sources:

- [Google Health Connect publishing and minimum-permission guidance](https://developer.android.com/health-and-fitness/health-connect/publish)
- [Google Health Connect architecture](https://developer.android.com/health-and-fitness/health-connect/architecture)
- [Apple health and fitness developer guidance](https://developer.apple.com/health-fitness/)
- [Apple consumer health privacy principles](https://www.apple.com/legal/privacy/consumer-health-personal-data/en-ww/)

## 6. API and application security

The OWASP API Security Top 10 highlights object-level authorization and broken authentication as common API failures. OAuth 2.0 Security BCP (RFC 9700) updates practical security guidance and deprecates unsafe modes.

Prototype controls implemented:

- Argon2id password hashes.
- Short-lived signed JWT access token and explicit role checks.
- Object-level access control: a policyholder can read only their own record.
- Pydantic input constraints and reject-by-default enums.
- Restricted development CORS origins from environment variables.
- Generic error responses; no stack traces returned.
- Security headers and request correlation ID.
- No secrets committed; fail-fast production secret requirements.
- No raw wearable data or passwords in audit/log output.
- Audit events for login, consent change, score, explanation, pricing simulation, and review.
- Rate-limit hook documented as future distributed control; no false claim that process-local demo limiting is production-ready.

Production gates:

- Enterprise OIDC/BFF or equivalent identity provider.
- MFA, refresh-token rotation/sender constraint, key rotation, revocation, session management.
- Managed secrets/KMS, TLS termination, WAF/API gateway, distributed rate limiting.
- SAST/DAST/dependency/container scanning and penetration test.
- Database encryption, backup/restore tests, field-level protection where required.

Sources:

- [OWASP API Security Top 10 — 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [OAuth 2.0 Security Best Current Practice — RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html)

## 7. Comparable product lessons

### Vitality

Vitality demonstrates a shared-value insurance pattern: give the customer near-term rewards and nudges for healthy behaviour instead of talking only about distant claims savings. Its claims are company claims, not evidence for Takamol.

MVP lesson:

- Separate risk assessment from engagement/reward rules.
- Make reward progress understandable and reversible.
- Avoid treating non-participation as proof of higher risk.
- Show immediate customer value while preserving insurer governance.

Sources:

- [Vitality shared-value behaviour model](https://www.vitalitygroup.com/vitalityapplestudy/)
- [Vitality reward positioning](https://www.vitalityglobal.com/reward-power)

### LifeQ

LifeQ demonstrates market interest in wearable-derived physiological intelligence and broad biomarker platforms. Its performance and biomarker counts are company claims.

MVP lesson:

- Do not compete on sensor hardware.
- Keep the provider layer replaceable.
- Differentiate through actuarial workflow, transparent model governance, Egyptian calibration, and insurer integration.

Source: [LifeQ](https://www.lifeq.com/)

## 8. UX practices derived from the 3-minute demo constraint

The supplied mockups are used as a visual reference: warm neutral canvas, navy/gold identity, cards, clear progress, insurer-grade rather than fitness-app styling.

The live product uses:

1. A “Start guided demo” control with nine explicit stages.
2. One primary action per stage.
3. Role-specific navigation and terminology.
4. Persistent evidence badges: `Synthetic Demo Data`, `Research Evidence`, or `Target Production Architecture`.
5. Detail-on-demand: key disclaimer next to the claim; full limitations in a drawer/page.
6. No excessive animation; only state/progress transitions.
7. Arabic-first RTL UI with English technical identifiers where needed.
8. Accessible color plus text/icon labels; risk is never communicated by color alone.

## 9. Architecture decision record

```text
React + TypeScript + Vite
        ↓ REST / OpenAPI
FastAPI application factory
        ↓ domain services
SQLite demo repository (DATABASE_URL replaceable)
        ↓
Biomarker config + model registry + audit events
```

Boundaries:

- `providers/`: wearable adapters.
- `models/`: risk model interface and registry metadata.
- `services/`: biological age, risk, explainability, pricing, consent, portfolio.
- `repositories/`: persistence boundary.
- `api/`: role and object authorization, schemas, OpenAPI.
- Frontend API client is the only data-access layer.

## 10. Explicit assumptions and unresolved gates

1. The 17 exact wearable thesis variables are not available in an auditable artifact. The MVP uses 17 clearly marked configurable demo indicators; replacement instructions and TODO fields are mandatory.
2. No trained DeepSurv artifact is available. The placeholder cannot silently fall back in `model` mode.
3. Pricing uses a deterministic configurable simulation and does not calculate a filed/approved insurance premium.
4. Synthetic policyholders use fictional names and deterministic seeds; no real personal data is included.
5. FRA pilot forms, decisions, insurer product family, and final success thresholds must be supplied during a formal scoping process.
6. The 5,000-policy figure is a proposed boundary from the business plan.
7. SQLite is for local demonstration. PostgreSQL, migrations, backup, HA, and tenant isolation are production work.
8. JWT demo authentication is not presented as enterprise identity.
9. “Digital Biological Age” always appears as “Takamol Digital Biological Age Estimate” with the non-medical disclaimer.
10. A local insurer cohort and linked outcomes are required before Egyptian calibration or any real pricing use.

Content from web sources was paraphrased for compliance with licensing restrictions. All product controls remain subject to qualified Egyptian legal, actuarial, security, and regulatory review.
