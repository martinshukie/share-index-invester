// Content for the NDIS Sole Trader Audit Pack.
// Every policy has: policy statement + procedure (bodyHtml), a compact audit
// synopsis, and a list of related form/register IDs (see FORMS below).
// {{TOKENS}} are filled in from Provider Details at render time (see utils.js).

const POLICIES = [
  // ---------------------------------------------------------------- GOVERNANCE & OPERATIONS
  {
    id: 'governance-business',
    category: 'Governance & Operations',
    title: 'Governance and Business Management Policy',
    standardRef: 'Core Module — Governance and Operational Management',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To set out how {{BUSINESS_NAME}} (ABN {{ABN}}), operating as a sole trader NDIS
      provider, is governed, managed and held accountable, given there is no board or
      management committee.</p>
      <h4>Policy</h4>
      ${ul([
        '{{PROVIDER_NAME}} is the sole trader, business owner and sole worker, and holds full accountability for all decisions, supports delivered and compliance obligations.',
        'The business operates under ABN {{ABN}} and, once registered, NDIS Provider Registration Number {{NDIS_REG_NUMBER}}.',
        'All policies in this pack are formally adopted, reviewed annually (or sooner after an incident, complaint, or regulatory change), and version-controlled.',
        'Statutory obligations are tracked and kept current: NDIS Worker Screening Check, Working with Children Check (if supporting participants under 18), professional indemnity and public liability insurance, and any required licences.',
        'A structured decision-making record is kept for significant business decisions (e.g. taking on a new participant with complex needs, ceasing a service) using the Business Decision Log.',
        'Compliance is treated as a serious business risk, not a formality: the National Disability Insurance Scheme Amendment (Integrity and Safeguarding) Act 2026 (Royal Assent 8 April 2026) significantly increased civil penalties for Code of Conduct and registration breaches — including a new "serious contravention" category for significant failures or systemic non-compliance — and expanded the NDIS Commission\'s enforcement powers.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Review this policy pack annually in {{DATE}}\'s month and log the review on the Policy Review Register.',
        'Keep a single "Compliance Folder" (physical or cloud) containing: insurance certificates of currency, NDIS Worker Screening Check, ABN registration, this policy pack, and all completed forms/registers.',
        'Before accepting a new participant, confirm the supports requested are within scope of registration and personal competence (see Access, Entry &amp; Exit Policy).',
        'Renew insurances and screening checks before expiry; set calendar reminders 60 days out.',
      ])}
    `,
    forms: ['coi-register', 'business-decision-log', 'compliance-folder-checklist'],
    synopsis: {
      purpose: 'Defines accountability and oversight for a one-person NDIS business with no board/committee.',
      keyControls: [
        'Sole trader accountable for all decisions and compliance',
        'Annual policy review cycle, version controlled',
        'Central Compliance Folder with all statutory evidence',
        'Renewal reminders for insurance and screening checks',
      ],
      evidence: ['Compliance Folder', 'Policy Review Register', 'Business Decision Log'],
      reviewCycle: 'Annually, or after a significant incident/complaint/regulatory change',
    },
  },
  {
    id: 'conflict-of-interest',
    category: 'Governance & Operations',
    title: 'Conflict of Interest Policy',
    standardRef: 'Core Module — Governance and Operational Management',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To identify, disclose and manage any actual, potential or perceived conflict of
      interest between {{PROVIDER_NAME}}'s personal, financial or other interests and the
      interests of participants.</p>
      <h4>Policy</h4>
      ${ul([
        'A conflict of interest exists where personal, financial, family or other relationships could improperly influence decisions about a participant\'s supports.',
        'All actual, potential and perceived conflicts are disclosed and recorded on the Conflict of Interest Register before, or as soon as practicable after, they arise.',
        'Where a conflict cannot be safely managed (e.g. providing supports to a close family member and independently managing their NDIS plan), the participant is referred to an alternative provider or independent decision-maker is engaged.',
        'No gifts, gratuities or benefits are accepted from participants or their families beyond token items of nominal value (under $50), and any offered are logged.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'At intake, screen for any personal or financial connection to the prospective participant or their support network.',
        'Record any conflict, however minor, on the Conflict of Interest Register within 5 business days.',
        'For material conflicts, discuss with the participant (and their nominee/guardian if applicable) how the conflict will be managed, or decline/refer the referral.',
        'Review the Register at each annual policy review.',
      ])}
    `,
    forms: ['coi-register'],
    synopsis: {
      purpose: 'Ensures personal or financial interests never compromise decisions made about a participant.',
      keyControls: ['Mandatory disclosure and logging', 'Referral pathway when conflict cannot be managed', 'Gift/benefit limit of $50 with a log'],
      evidence: ['Conflict of Interest Register'],
      reviewCycle: 'Ongoing disclosure; register reviewed annually',
    },
  },
  {
    id: 'risk-management',
    category: 'Governance & Operations',
    title: 'Risk Management Policy',
    standardRef: 'Core Module — Governance and Operational Management',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To identify, assess, treat and monitor risks to participants, {{PROVIDER_NAME}}, and
      the business, across service delivery, work health &amp; safety, financial and
      reputational domains.</p>
      <h4>Policy</h4>
      ${ul([
        'Risks are assessed using a Likelihood x Consequence matrix (Low / Medium / High / Extreme) before a new participant is onboarded, before a new support type is delivered, and whenever circumstances change materially.',
        'Participant-specific risks (e.g. behaviours of concern, falls risk, medical conditions, home/environmental hazards) are documented in the individual Support Plan and reassessed at each plan review.',
        'Business risks (e.g. sole trader illness/injury interrupting supports, cyber/data loss, financial risk) are documented on the Risk Register and reviewed annually.',
        'Risk treatments are proportionate: Extreme and High risks require a documented control plan before supports proceed.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Complete a risk assessment at intake using the Risk Register &amp; Assessment Template, covering the participant, the environment(s) supports are delivered in, and the specific tasks/activities.',
        'Identify controls for each risk rated Medium or above (e.g. manual handling equipment, two-person assist referral, home hazard remediation before first visit).',
        'Re-assess after any incident, near-miss, or change in participant health/behaviour, and at minimum every 12 months.',
        'Keep a business continuity risk noted separately — see Business Continuity &amp; Emergency Management Policy.',
      ])}
    `,
    forms: ['risk-register'],
    synopsis: {
      purpose: 'Systematic identification and control of risks to participants and the business.',
      keyControls: ['Likelihood x Consequence risk matrix', 'Risk assessment at intake and each plan review', 'Documented controls for Medium+ risks'],
      evidence: ['Risk Register & Assessment Template', 'Individual Support Plans'],
      reviewCycle: 'At intake, each plan review, after incidents, and at least annually',
    },
  },
  {
    id: 'hr-worker-screening',
    category: 'Governance & Operations',
    title: 'Human Resources, Worker Screening & Competency Policy',
    standardRef: 'Core Module — Governance and Operational Management',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To ensure {{PROVIDER_NAME}} is suitable, screened, qualified and competent to deliver
      the supports offered, and maintains that suitability over time. As a sole trader there
      are no employees; this policy applies self-management equivalents to what an
      organisation would apply to staff.</p>
      <h4>Policy</h4>
      ${ul([
        'A current NDIS Worker Screening Check clearance is held at all times and renewed before expiry (checks remain valid for 5 years; a lapsed clearance means supports must stop immediately, with no grace period — note that the first wave of 5-year renewals, for clearances first issued from February 2021, began falling due from February 2026 and continues through 2026–27, so renewal timing deserves particular attention now).',
        'Relevant qualifications, first aid/CPR certification, and any required checks (e.g. Working with Children Check) are current and evidenced in the Compliance Folder.',
        'Skills and knowledge are kept current through at least one continuing professional development (CPD) activity relevant to disability support per quarter, logged on the CPD Log.',
        'A self-assessment against the NDIS Code of Conduct and this policy pack is completed annually.',
        'A capacity/wellbeing check-in is self-conducted before each work day; supports are not delivered while unfit (illness, fatigue, impairment) without first arranging alternative cover or rescheduling with the participant.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Diarise Worker Screening Check, first aid, CPR and any licence/qualification expiry dates 90 days ahead and renew before lapse.',
        'Complete and log CPD activities (e.g. NDIS Commission e-learning modules, manual handling refreshers, mental health first aid) on the CPD Log each quarter.',
        'Do not accept referrals for support types outside current competency/qualification without first completing relevant training.',
        'Keep evidence of all screening, qualifications and CPD in the Compliance Folder for audit.',
      ])}
    `,
    forms: ['screening-checklist', 'cpd-log'],
    synopsis: {
      purpose: 'Confirms the sole trader is screened, qualified, competent and fit to deliver supports.',
      keyControls: ['Current Worker Screening Check', 'Quarterly CPD', 'Annual Code of Conduct self-assessment', 'Daily fitness-for-work check'],
      evidence: ['Worker Screening & Qualifications Checklist', 'CPD Log', 'Compliance Folder'],
      reviewCycle: 'Ongoing renewal tracking; formal self-assessment annually',
    },
  },
  {
    id: 'whs',
    category: 'Governance & Operations',
    title: 'Work Health & Safety (WHS) Policy',
    standardRef: 'Core Module — Governance and Operational Management / Support Provision Environment',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To protect the health and safety of {{PROVIDER_NAME}}, participants and others, in
      line with the applicable state/territory Work Health and Safety Act, when supports are
      delivered in participants' homes, vehicles and the community.</p>
      <h4>Policy</h4>
      ${ul([
        'A WHS hazard check is completed at the first visit to any new location (participant\'s home, vehicle, community venue) and reviewed if the environment changes.',
        'Manual handling tasks (transfers, lifting) are only performed using safe techniques and equipment; unsafe tasks (e.g. lifting beyond safe limits without equipment) are declined and escalated to the participant/support coordinator for alternative arrangements.',
        'Basic first aid supplies are carried; a current first aid certificate is held.',
        'Incidents and hazards affecting health and safety are recorded and reported per the Incident Management Policy.',
        'Vehicle used for transport-related supports is registered, insured and roadworthy; a pre-drive safety check is a habit before transporting participants.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'On first visit, complete the Home &amp; Community Visit Safety Checklist covering trip hazards, pets, infection control, emergency exits, and any equipment needed.',
        'Note any hazard requiring remediation before supports proceed (e.g. loose rugs, no smoke alarm) and communicate this to the participant/nominee.',
        'Re-check annually or whenever the environment changes materially.',
        'Report any injury to self, no matter how minor, on the Incident Report Form.',
      ])}
    `,
    forms: ['home-visit-safety-checklist', 'incident-report-form'],
    synopsis: {
      purpose: 'Manages health and safety risks across homes, vehicles and community settings.',
      keyControls: ['Hazard check at first visit', 'Safe manual handling only', 'Current first aid certification', 'Vehicle safety checks for transport supports'],
      evidence: ['Home & Community Visit Safety Checklist', 'First aid certificate'],
      reviewCycle: 'At first visit to a new environment, annually, and after any change',
    },
  },
  {
    id: 'business-continuity',
    category: 'Governance & Operations',
    title: 'Business Continuity & Emergency/Disaster Management Policy',
    standardRef: 'Core Module — Governance and Operational Management',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To ensure participants continue to receive safe supports, or a safe handover occurs,
      if {{PROVIDER_NAME}} is unexpectedly unavailable (illness, injury, natural disaster) or
      the business cannot operate as normal.</p>
      <h4>Policy</h4>
      ${ul([
        'Every participant has at least one identified backup option documented in their Support Plan: a nominated alternative provider, family/informal support, or their support coordinator\'s contact, to call on if {{PROVIDER_NAME}} cannot attend.',
        'Participant records essential for continuity of care (current Support Plan, emergency contacts, medical/medication information) are backed up in a cloud location accessible if physical records are unavailable (e.g. house fire, device loss).',
        'A natural disaster/emergency plan is maintained for the local area (bushfire, flood, extreme heat, pandemic) with participant-specific considerations (mobility, medical equipment reliant on power, evacuation support needs).',
        'Participants are notified as early as possible of any planned or unplanned service interruption.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'At intake, document each participant\'s backup contact/alternative arrangement on their Support Plan.',
        'Maintain a Business Continuity Contact List (participants, their emergency contacts, support coordinators, GP, local emergency services).',
        'Back up digital records weekly to a secure cloud provider using multi-factor authentication.',
        'If unable to attend a scheduled visit, contact the participant (or nominee) as soon as possible and activate the backup arrangement if needed.',
        'Review the Emergency &amp; Disaster Response Plan annually and before the relevant seasonal risk period (e.g. before bushfire season).',
      ])}
    `,
    forms: ['emergency-plan', 'continuity-contacts'],
    synopsis: {
      purpose: 'Keeps participants safe and supported if the sole trader is unavailable or a disaster occurs.',
      keyControls: ['Documented backup arrangement per participant', 'Cloud-backed records', 'Area-specific emergency plan', 'Early notification of interruptions'],
      evidence: ['Emergency & Disaster Response Plan', 'Business Continuity Contact List', 'Support Plans (backup contact field)'],
      reviewCycle: 'Annually and before seasonal risk periods',
    },
  },
  {
    id: 'privacy-records',
    category: 'Governance & Operations',
    title: 'Privacy, Dignity & Records Management Policy',
    standardRef: 'Core Module — Rights and Responsibilities / Governance and Operational Management',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To protect participants' privacy and dignity and manage personal information in line
      with the Privacy Act 1988 (Cth), the Australian Privacy Principles, and the NDIS Code of
      Conduct.</p>
      <h4>Policy</h4>
      ${ul([
        'Personal and health information is collected only as needed to deliver safe supports, with the participant\'s (or nominee\'s) informed consent captured on the Privacy Consent &amp; Information Sharing Form.',
        'Information is stored securely: physical records locked/out of public view; digital records password protected and, where possible, encrypted, with access limited to {{PROVIDER_NAME}}.',
        'Information is only shared with third parties (support coordinators, family, other providers, NDIS Commission) with consent, or where required/authorised by law (e.g. mandatory reporting, reportable incidents).',
        'Participants can access their own records on request and can withdraw consent to information sharing at any time.',
        'Dignity is upheld in all interactions: supports are delivered discreetly, personal care is never conducted in the presence of others without consent, and participants are addressed as they wish to be addressed.',
        'Records are retained for the period required by the NDIS Commission (currently a minimum of 7 years) and securely destroyed after that.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Obtain signed privacy consent at onboarding before collecting or sharing any personal information.',
        'Store paper files in a locked cabinet; store digital files in a password-protected, backed-up cloud folder.',
        'Before sharing any information with a third party, confirm current consent covers that disclosure.',
        'Apply the Records Retention &amp; Disposal Schedule; securely shred paper and permanently delete digital records once the retention period lapses.',
        'Respond to a participant\'s request to access or correct their records within 14 days.',
      ])}
    `,
    forms: ['privacy-consent', 'records-schedule'],
    synopsis: {
      purpose: 'Protects participant privacy, dignity and personal information across its lifecycle.',
      keyControls: ['Consent captured before collection/sharing', 'Secure physical and digital storage', 'Access and correction rights honoured', 'Defined retention and secure destruction'],
      evidence: ['Privacy Consent & Information Sharing Form', 'Records Retention & Disposal Schedule'],
      reviewCycle: 'Annually, and consent reconfirmed at each Support Plan review',
    },
  },
  {
    id: 'financial-management',
    category: 'Governance & Operations',
    title: 'Financial Management & Fees Policy',
    standardRef: 'Core Module — Governance and Operational Management',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To ensure fair, transparent and compliant billing of NDIS-funded supports.</p>
      <h4>Policy</h4>
      ${ul([
        'Fees charged do not exceed the applicable maximum prices set out in the NDIS Pricing Schedule (the annual pricing publication that, from 1 July 2026, replaced the former "NDIS Pricing Arrangements and Price Limits") in force at the time of service.',
        'Only supports actually delivered are billed; cancellation charges follow the current NDIS short-notice cancellation policy and are explained to the participant in the Service Agreement before they apply.',
        'Invoices/claims clearly itemise date, support item number, duration and cost, and are issued promptly (within 7 days of service where the participant is self- or plan-managed).',
        'Business and participant funds are never mixed; {{PROVIDER_NAME}} does not have access to, or control of, a participant\'s NDIS plan funds or bank accounts.',
        'Financial records (invoices, payments, price schedule versions used) are retained for audit and taxation purposes.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Check the current NDIS Pricing Schedule (published alongside the NDIA\'s Annual Pricing Review, effective 1 July each year) before setting or updating the Fee Schedule.',
        'Record each service delivered (date, time, support item, duration) at the time of or immediately after the visit.',
        'Issue invoices/claims within 7 days, referencing the correct support item number and the Service Agreement.',
        'Reconcile invoices issued against payments received monthly.',
        'Retain financial records for at least 5 years for taxation purposes and 7 years where they also form NDIS service records.',
      ])}
    `,
    forms: ['fee-schedule'],
    synopsis: {
      purpose: 'Ensures billing is accurate, transparent and within NDIS price limits.',
      keyControls: ['Compliance with the current NDIS Pricing Schedule', 'Billing only for supports delivered', 'Prompt, itemised invoicing', 'No access to participant funds'],
      evidence: ['Fee Schedule & NDIS Pricing Schedule Reference', 'Invoices/claims records'],
      reviewCycle: 'On each annual NDIS Pricing Schedule update (effective 1 July) and reconciled monthly',
    },
  },

  // ---------------------------------------------------------------- RIGHTS & SAFEGUARDING
  {
    id: 'code-of-conduct',
    category: 'Rights & Safeguarding',
    title: 'NDIS Code of Conduct & Participant Rights Policy',
    standardRef: 'Core Module — Rights and Responsibilities',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To commit {{PROVIDER_NAME}} to upholding the NDIS Code of Conduct and every
      participant's rights to dignity, respect, choice and control.</p>
      <h4>Policy</h4>
      <p>{{PROVIDER_NAME}} commits to:</p>
      ${ul([
        'Act with respect for individual rights to freedom of expression, self-determination and decision-making, in accordance with applicable laws and conventions.',
        'Respect the privacy of participants.',
        'Provide supports and services in a safe and competent manner, with care and skill.',
        'Act with integrity, honesty and transparency.',
        'Promptly take steps to raise and act on concerns about matters that may impact the quality and safety of supports.',
        'Take all reasonable steps to prevent and respond to all forms of violence, exploitation, neglect and abuse.',
        'Take all reasonable steps to prevent and respond to sexual misconduct.',
        'Never use restrictive practices except as a last resort, in line with the Restrictive Practices Policy, and in the least restrictive way possible.',
      ])}
      <p>Participants have the right to: be treated with respect; make their own choices; receive supports free from abuse, neglect, violence and exploitation; access an interpreter or advocate; make a complaint without fear of reprisal; and access their own information.</p>
      <p>The Code of Conduct applies whether or not a provider is NDIS-registered, and the NDIS Commission can investigate any person delivering NDIS-funded supports. Since the National Disability Insurance Scheme Amendment (Integrity and Safeguarding) Act 2026, breaches carry substantially higher civil penalties (standard contraventions up to $52,500 for an individual; serious contraventions — significant failures or systemic non-compliance — attracting penalties in the millions), so this commitment is treated as a legal, not just professional, obligation.</p>
      <h4>Procedure</h4>
      ${ol([
        'Provide every new participant a copy of this policy and the Service Charter in the onboarding pack, in an accessible format.',
        'Explain rights and the complaints process verbally at the first visit, checking understanding.',
        'Complete the annual Code of Conduct self-assessment (see HR &amp; Worker Screening Policy).',
        'Escalate any concern about a possible Code of Conduct breach (including self-identified) to the NDIS Commission per the Incident Management Policy.',
      ])}
    `,
    forms: [],
    synopsis: {
      purpose: 'States the commitment to the NDIS Code of Conduct and each participant\'s rights.',
      keyControls: ['Rights explained at onboarding in accessible format', 'Annual self-assessment against the Code', 'Clear escalation pathway for breaches'],
      evidence: ['Signed onboarding acknowledgement', 'Annual Code of Conduct self-assessment'],
      reviewCycle: 'Annually',
    },
  },
  {
    id: 'complaints',
    category: 'Rights & Safeguarding',
    title: 'Complaints Management and Resolution Policy',
    standardRef: 'Core Module — Rights and Responsibilities',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To ensure participants, families and others can raise concerns easily, safely and
      without fear of reprisal, and have them resolved fairly and promptly.</p>
      <h4>Policy</h4>
      ${ul([
        'Complaints can be made verbally, in writing, by phone, email, or through an advocate/support coordinator, and anonymously if preferred.',
        'Every participant is told at onboarding how to complain to {{PROVIDER_NAME}} directly, and how to complain to the NDIS Quality and Safeguards Commission (1800 035 544, ndiscommission.gov.au) if they are not comfortable doing so directly or are unhappy with the outcome.',
        'No participant will experience reduced supports, retaliation or any other negative consequence for making a complaint.',
        'Complaints are acknowledged within 2 business days and a resolution attempted within 21 days; if longer is needed the complainant is updated on progress.',
        'Serious complaints (e.g. alleging abuse, neglect, or a Code of Conduct breach) are also managed as a reportable incident where applicable.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Log every complaint on the Complaints Register on the day it is received, including how it was made and by whom.',
        'Acknowledge receipt with the complainant within 2 business days, and confirm how they would like to be kept informed.',
        'Investigate: gather relevant facts, speak with the complainant, review records.',
        'Agree and implement a resolution or improvement action with the complainant; record the outcome and date closed on the Register.',
        'If the complaint indicates a systemic issue, update the relevant policy/procedure and record this on the Policy Review Register.',
        'Where the complaint meets the reportable incident threshold, follow the Incident Management Policy in parallel.',
      ])}
    `,
    forms: ['complaints-register'],
    synopsis: {
      purpose: 'Gives participants a safe, accessible way to raise concerns and have them resolved.',
      keyControls: ['Multiple accessible ways to complain', 'No-reprisal guarantee', 'Acknowledged in 2 days, resolved within 21', 'NDIS Commission escalation path explained upfront'],
      evidence: ['Complaints Register', 'Onboarding pack (complaints info)'],
      reviewCycle: 'Each complaint logged in real time; register reviewed quarterly',
    },
  },
  {
    id: 'incident-management',
    category: 'Rights & Safeguarding',
    title: 'Incident Management Policy (incl. Reportable Incidents)',
    standardRef: 'Core Module — Rights and Responsibilities / Governance and Operational Management',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To ensure incidents involving participants are identified, responded to safely,
      recorded, and — where required — reported to the NDIS Quality and Safeguards
      Commission within legislated timeframes.</p>
      <h4>Policy</h4>
      ${ul([
        'An incident is any event that has caused, or could have caused, harm to a participant during the provision of supports.',
        'A reportable incident (which must be notified to the NDIS Commission) includes: the death of a participant; serious injury of a participant; abuse or neglect of a participant; unlawful sexual or physical contact with, or assault of, a participant; sexual misconduct involving a participant; and unauthorised use of a restrictive practice.',
        '<strong>Priority incidents</strong> — death or serious injury of a participant — are notified to the NDIS Commission within <strong>24 hours</strong> of {{PROVIDER_NAME}} becoming aware.',
        'The other reportable incident categories (abuse/neglect, unlawful sexual or physical contact/assault, sexual misconduct, unauthorised restrictive practice) are notified within <strong>5 business days</strong>, unless the incident involves an ongoing or immediate risk to a participant\'s safety — or, for an unauthorised restrictive practice, actually caused harm — in which case it is treated as a priority incident and notified within 24 hours instead.',
        'A detailed written report follows the initial notification within 5 business days for every reportable incident.',
        'When it is genuinely unclear whether an incident is a priority incident, it is notified within 24 hours — the shorter timeframe is used by default.',
        'Immediate participant safety and wellbeing (including medical attention) always comes first, before administrative reporting steps.',
        'All incidents, reportable or not, are recorded, and used to identify and act on any pattern or systemic risk.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Ensure the participant is safe; call 000 for emergencies; provide or arrange first aid.',
        'Notify the participant\'s emergency contact, support coordinator and/or nominee as appropriate.',
        'Complete the Incident Report Form as soon as practicable.',
        'Assess against the reportable incident criteria using the Reportable Incident Notification Checklist, including whether it is a priority incident.',
        'If reportable: submit the initial notification to the NDIS Commission via the NDIS Commission Portal within 24 hours (priority incidents) or 5 business days (other reportable incidents, default to 24 hours if unsure), followed by the detailed written report within 5 business days.',
        'Review the incident for root cause and update the Risk Register/relevant policy if a systemic control is needed.',
        'Keep all incident records in the Compliance Folder for audit.',
      ])}
      <p><em>Reportable incident categories and timeframes are set by the NDIS Commission and can change — always confirm the current thresholds at ndiscommission.gov.au before relying on this summary.</em></p>
    `,
    forms: ['incident-report-form', 'reportable-incident-checklist'],
    synopsis: {
      purpose: 'Ensures a safe, timely response to incidents and correct notification of reportable incidents.',
      keyControls: ['Participant safety first', '24-hour notification for priority incidents (death/serious injury)', '5 business days for other reportable incidents (24 hours if unsure or risk is ongoing)', 'Detailed written report within 5 business days', 'Root cause review feeding back into Risk Register'],
      evidence: ['Incident Report Form', 'Reportable Incident Notification Checklist', 'NDIS Commission Portal notification records'],
      reviewCycle: 'Each incident in real time; policy reviewed annually, and timeframes re-checked against ndiscommission.gov.au',
    },
  },
  {
    id: 'restrictive-practices',
    category: 'Rights & Safeguarding',
    title: 'Restrictive Practices Policy',
    standardRef: 'Core Module — Rights and Responsibilities',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To confirm {{PROVIDER_NAME}}'s position on restrictive practices and the process
      that would apply if one were ever considered necessary.</p>
      <h4>Policy</h4>
      ${ul([
        '{{PROVIDER_NAME}} does not use any form of restrictive practice (seclusion, chemical, mechanical, physical or environmental restraint, or restricting access to objects) as a routine part of service delivery.',
        'A restrictive practice would only ever be considered as an absolute last resort, in response to an imminent, serious risk of harm, for the shortest time and to the least restrictive extent possible.',
        'Any use of a restrictive practice, planned or unplanned, requires prior authorisation under state/territory law and must be part of an NDIS Behaviour Support Plan prepared by a specialist behaviour support practitioner — a service {{PROVIDER_NAME}} does not provide directly and would refer out for.',
        'Any unauthorised use of a restrictive practice is a reportable incident (see Incident Management Policy) and is notified to the NDIS Commission within 5 business days.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Sign the Restrictive Practice Statement / Nil Use Declaration for each participant at onboarding, confirming no restrictive practices are used.',
        'If a participant\'s behaviour presents an emerging risk that might warrant behaviour support, refer to the NDIS Commission-registered behaviour support provider network and the participant\'s support coordinator; do not implement any restrictive strategy independently.',
        'If a restrictive practice is ever used unplanned in an emergency, treat as a reportable incident immediately per the Incident Management Policy.',
      ])}
    `,
    forms: ['restrictive-practice-declaration'],
    synopsis: {
      purpose: 'States the nil-use position on restrictive practices and the referral pathway if behaviour support is ever needed.',
      keyControls: ['No routine use of restrictive practices', 'Last-resort-only threshold with prior authorisation', 'Referral to specialist behaviour support practitioners', 'Unauthorised use treated as reportable incident'],
      evidence: ['Restrictive Practice Statement / Nil Use Declaration (per participant)'],
      reviewCycle: 'Signed at onboarding; policy reviewed annually',
    },
  },
  {
    id: 'safeguarding',
    category: 'Rights & Safeguarding',
    title: 'Safeguarding: Abuse, Neglect, Exploitation & Violence Prevention Policy',
    standardRef: 'Core Module — Rights and Responsibilities',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To prevent, identify and respond to abuse, neglect, exploitation and violence
      (including sexual misconduct) affecting participants, whether by {{PROVIDER_NAME}}, a
      family member, another provider, or anyone else.</p>
      <h4>Policy</h4>
      ${ul([
        'Zero tolerance for abuse, neglect, exploitation and violence in any form.',
        'Participants are supported to understand their rights and how to raise a safety concern, including with someone other than {{PROVIDER_NAME}} (e.g. support coordinator, NDIS Commission, police).',
        'Signs of possible abuse, neglect or exploitation from any source (including within the participant\'s home/family) are taken seriously, documented, and escalated — this may include a mandatory report to police or child protection authorities where required by law.',
        'Financial exploitation safeguards: {{PROVIDER_NAME}} never accepts appointment as a participant\'s financial decision-maker, never has access to participant bank accounts, and never borrows money from or lends money to a participant.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'If {{PROVIDER_NAME}} observes or is told about possible abuse, neglect, exploitation or violence, complete the Safeguarding Concern Report Form the same day.',
        'Take immediate action to protect the participant if there is imminent risk (call 000 if needed).',
        'Escalate to the participant\'s support coordinator/nominee, and to the NDIS Commission or police as required, treating it as a reportable incident where the criteria are met.',
        'Never confront an alleged perpetrator directly; escalate to the appropriate authority instead.',
        'Follow up to confirm the participant is safe and supported (counselling/advocacy referral offered).',
      ])}
    `,
    forms: ['safeguarding-report'],
    synopsis: {
      purpose: 'Protects participants from abuse, neglect, exploitation and violence from any source.',
      keyControls: ['Zero tolerance', 'Same-day documentation of concerns', 'Escalation to authorities, not self-investigation', 'No financial decision-making role over participant funds'],
      evidence: ['Safeguarding Concern Report Form'],
      reviewCycle: 'Each concern in real time; policy reviewed annually',
    },
  },
  {
    id: 'feedback',
    category: 'Rights & Safeguarding',
    title: 'Feedback & Participant Voice Policy',
    standardRef: 'Core Module — Rights and Responsibilities',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To actively invite and act on participant feedback (positive and negative) to keep
      improving the quality of supports, separate from the formal Complaints process.</p>
      <h4>Policy</h4>
      ${ul([
        'Feedback is invited informally at each visit and formally at each Support Plan review.',
        'Feedback can be given verbally, in writing, via a support coordinator, or anonymously.',
        'All feedback, positive or constructive, is logged and reviewed for opportunities to improve service delivery.',
        'Participants are told feedback will never be held against them or affect their supports.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Ask an open feedback question (e.g. "Is there anything about your supports you would like to change?") at every Support Plan review.',
        'Record feedback received on the Feedback &amp; Compliments Log, including any action taken.',
        'Where feedback identifies a possible quality or safety issue, treat as a complaint and follow the Complaints Management Policy.',
        'Review the Log at the annual policy review to identify trends.',
      ])}
    `,
    forms: ['feedback-log'],
    synopsis: {
      purpose: 'Actively invites participant voice to drive continuous improvement.',
      keyControls: ['Feedback invited at every plan review', 'Multiple accessible channels', 'Logged and actioned', 'No-detriment guarantee'],
      evidence: ['Feedback & Compliments Log'],
      reviewCycle: 'Ongoing; log reviewed at each annual policy review',
    },
  },

  // ---------------------------------------------------------------- PROVISION OF SUPPORTS
  {
    id: 'access-entry-exit',
    category: 'Provision of Supports',
    title: 'Access, Entry, Exit & Transition Policy',
    standardRef: 'Core Module — Provision of Supports',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To ensure a fair, transparent process for accepting new participants, and a safe,
      planned process when supports end or transition to another provider.</p>
      <h4>Policy</h4>
      ${ul([
        'Referrals are accepted on the basis of fit between the participant\'s needs and {{PROVIDER_NAME}}\'s scope of registration, skills and availability — never on the basis of the referral being "easy" or any discriminatory factor.',
        'Where a referral is outside scope or capacity, the participant/referrer is told promptly and, where possible, referred to an alternative provider or the NDIS Provider Finder.',
        'Supports may end by mutual agreement, participant choice, {{PROVIDER_NAME}} being unable to continue safely, or non-payment; wherever possible, reasonable notice (minimum 14 days, except in a safety emergency) is given.',
        'On exit, a warm handover is offered: a summary of current supports and goals is provided (with consent) to the participant\'s new provider or support coordinator.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'On receiving a referral, complete the Referral &amp; Intake Form and assess fit against scope, competency and capacity within 5 business days.',
        'If accepted, proceed to the Client Onboarding process (see Onboarding section).',
        'If declined, advise the referrer/participant in writing within 5 business days with reasons and, where possible, alternative provider suggestions.',
        'When supports are ending, complete the Transition/Exit Checklist, give required notice, and offer a handover summary with the participant\'s consent.',
      ])}
    `,
    forms: ['transition-checklist'],
    synopsis: {
      purpose: 'Ensures fair intake decisions and a safe, planned exit/transition process.',
      keyControls: ['Fit-for-scope assessment within 5 business days', 'No discriminatory refusal', 'Minimum 14 days\' notice to end supports (except emergencies)', 'Consent-based handover on exit'],
      evidence: ['Referral & Intake Form', 'Transition/Exit Checklist'],
      reviewCycle: 'Applied at every intake/exit; policy reviewed annually',
    },
  },
  {
    id: 'service-planning',
    category: 'Provision of Supports',
    title: 'Person-Centred Planning & Service Agreement Policy',
    standardRef: 'Core Module — Provision of Supports',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To ensure supports are planned around each participant's own goals, preferences and
      NDIS plan, and formalised in a clear Service Agreement.</p>
      <h4>Policy</h4>
      ${ul([
        'Every participant has a written Service Agreement before supports begin, setting out supports to be delivered, pricing, cancellation terms, review date, and how to end the agreement.',
        'Every participant has an individual Support/Care Plan, developed with them (and their nominee/support coordinator as relevant), reflecting their NDIS plan goals, preferences, routines and any specific health/support needs.',
        'Support/Care Plans are reviewed at least every 12 months, or sooner if the participant\'s NDIS plan, needs, or circumstances change.',
        'Participants are supported to exercise choice and control over how, when and by whom (within the sole trader\'s own service) supports are delivered wherever possible.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'At onboarding, complete the NDIS Plan &amp; Goals Capture Sheet and develop the Individual Support/Care Plan collaboratively with the participant.',
        'Issue the Service Agreement (with Schedule of Supports &amp; Pricing) for the participant\'s signature before starting supports.',
        'Deliver supports in line with the current Support Plan; note any deviation and reason in visit notes.',
        'Review the Support Plan at least annually using the Support/Care Plan Review Log, and update immediately after any significant change.',
      ])}
    `,
    forms: ['support-plan-review-log'],
    synopsis: {
      purpose: 'Anchors supports to each participant\'s own goals through a clear agreement and living support plan.',
      keyControls: ['Signed Service Agreement before supports start', 'Individual Support Plan reflecting NDIS plan goals', 'Review at least every 12 months', 'Choice and control respected in delivery'],
      evidence: ['Service Agreement', 'Individual Support/Care Plan', 'Support/Care Plan Review Log'],
      reviewCycle: 'At least every 12 months, or after any significant change',
    },
  },
  {
    id: 'medication',
    category: 'Provision of Supports',
    title: 'Medication Management Policy',
    standardRef: 'Core Module — Provision of Supports',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To safely support participants with medication-related tasks within {{PROVIDER_NAME}}'s
      competency, as part of personal care and daily living supports.</p>
      <h4>Policy</h4>
      ${ul([
        'Medication assistance is only provided where documented in the participant\'s Support Plan and within the scope agreed with the participant, their GP/pharmacist or health professional.',
        'Assistance may include prompting/reminding, or supporting access to a pre-packed dose administration aid (e.g. Webster pack) prepared by a pharmacist — {{PROVIDER_NAME}} does not repackage, alter dosages, or administer injectable/schedule 8 medications without specific additional training and authorisation.',
        'Every instance of medication support is recorded on the Medication Administration Record (MAR) at the time it occurs.',
        'A medication error or adverse reaction is treated as an incident and managed per the Incident Management Policy, with medical advice sought immediately if needed.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Confirm the level of medication support required with the participant, GP/pharmacist, and record it in the Support Plan before providing any assistance.',
        'At each visit involving medication support, check the dose against the pharmacist label/Webster pack, assist as agreed, and complete the MAR immediately.',
        'If a dose is missed, refused, or an error occurs, record on the MAR and the Incident Report Form, and contact the pharmacist/GP or 000 if there is any health risk.',
        'Store any medication the participant asks {{PROVIDER_NAME}} to handle securely and only as agreed; never adjust a dose without medical authorisation.',
      ])}
    `,
    forms: ['medication-record'],
    synopsis: {
      purpose: 'Sets safe boundaries and recording requirements for medication-related support.',
      keyControls: ['Only within documented, agreed scope', 'No dose alteration or unsupervised administration of high-risk medications', 'MAR completed every instance', 'Errors treated as incidents with immediate medical escalation'],
      evidence: ['Medication Administration Record (MAR)', 'Support Plan (medication support field)'],
      reviewCycle: 'Every visit involving medication; scope reviewed at each Support Plan review',
    },
  },
  {
    id: 'infection-control',
    category: 'Provision of Supports',
    title: 'Infection Control & Safe Manual Handling Policy',
    standardRef: 'Core Module — Provision of Supports / Support Provision Environment',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To minimise infection risk and prevent injury during personal care and daily living
      support tasks.</p>
      <h4>Policy</h4>
      ${ul([
        'Standard infection control precautions are followed for all personal care: hand hygiene before and after contact, use of gloves for any contact with bodily fluids, and appropriate disposal of waste/sharps.',
        '{{PROVIDER_NAME}} does not attend a visit involving close personal contact while personally unwell with a transmissible illness, unless alternative precautions (mask, minimal contact) make it safe, and will reschedule if unsafe.',
        'Manual handling tasks (transfers, repositioning, showering support) are only carried out using techniques and equipment appropriate to the participant\'s assessed needs, per the Risk Management Policy; tasks requiring equipment or a second person that is not available are not attempted.',
        'Participant-specific equipment (hoists, slide sheets, shower chairs) is checked for safe working condition before use.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Complete the Infection Control Checklist at the first personal care visit and whenever the participant\'s health status changes (e.g. new wound, infection).',
        'Carry and use personal protective equipment (gloves, hand sanitiser) at every personal care visit.',
        'Confirm any manual handling equipment required is available and in safe condition before attempting a transfer/repositioning task.',
        'Report any near-miss or injury during manual handling on the Incident Report Form.',
      ])}
    `,
    forms: ['infection-control-checklist', 'incident-report-form'],
    synopsis: {
      purpose: 'Reduces infection and injury risk in hands-on personal care support.',
      keyControls: ['Standard precautions at every personal care visit', 'No attendance while infectious without safe alternative precautions', 'Equipment-appropriate manual handling only', 'Equipment safety checked before use'],
      evidence: ['Infection Control Checklist', 'Incident Report Form (near-misses)'],
      reviewCycle: 'At first visit, on health status change, and annually',
    },
  },
  {
    id: 'community-access-safety',
    category: 'Provision of Supports',
    title: 'Community Access & Home Visit Safety Policy',
    standardRef: 'Core Module — Support Provision Environment',
    bodyHtml: `
      <h4>Purpose</h4>
      <p>To keep participants and {{PROVIDER_NAME}} safe while delivering community access,
      social participation, household task and transport-related supports outside a
      controlled facility.</p>
      <h4>Policy</h4>
      ${ul([
        'Before supporting community access, the venue/activity is checked for reasonable safety and accessibility for the participant\'s needs.',
        'A basic itinerary/whereabouts note (destination, expected return time) is kept for each community outing, and shared with a nominee/family member for higher-risk outings.',
        'Household task supports (cleaning, gardening) use equipment safely and do not extend into tasks presenting unmanaged risk (e.g. working at height without fall protection) — such tasks are declined and alternative arrangements suggested.',
        'If transporting a participant, the vehicle is registered, insured (including for carrying passengers for a fee where required by the insurer) and roadworthy, and the participant is seated safely (seatbelt/restraint as required).',
        'Money handling during community access (e.g. paying for an activity) is limited to reimbursable, receipted transactions on the participant\'s behalf and with their authority — {{PROVIDER_NAME}} never holds a participant\'s card or account access.',
      ])}
      <h4>Procedure</h4>
      ${ol([
        'Before a new community activity, complete a quick safety/accessibility check and note it in visit records.',
        'Record destination and expected return time for outings; check in with a nominee for higher-risk activities.',
        'Decline household tasks presenting unmanaged risk (e.g. ladder work above a safe height) and document the alternative offered.',
        'Keep receipts for any purchase made on a participant\'s behalf and provide these to the participant/nominee promptly.',
        'Check vehicle registration, insurance and condition regularly if used for transport supports.',
      ])}
    `,
    forms: ['home-visit-safety-checklist'],
    synopsis: {
      purpose: 'Manages safety and financial-integrity risks specific to out-of-home community, household and transport supports.',
      keyControls: ['Venue/activity safety check', 'Whereabouts noted for outings', 'Unmanaged-risk tasks declined', 'Receipted handling of any participant funds, never account access'],
      evidence: ['Home & Community Visit Safety Checklist', 'Receipts for participant purchases'],
      reviewCycle: 'Before new activities/venues; policy reviewed annually',
    },
  },
];

const FORMS = [
  { id: 'coi-register', title: 'Conflict of Interest Register', policyIds: ['governance-business', 'conflict-of-interest'],
    bodyHtml: `<p>Log every actual, potential or perceived conflict of interest.</p>` +
      table(['Date identified', 'Participant', 'Nature of conflict', 'Management action', 'Reviewed by', 'Date resolved/closed'],
        [['', '', '', '', '{{PROVIDER_NAME}}', '']]) },
  { id: 'business-decision-log', title: 'Business Decision Log', policyIds: ['governance-business'],
    bodyHtml: `<p>Record significant business decisions and the reasoning behind them.</p>` +
      table(['Date', 'Decision', 'Reason / options considered', 'Outcome'], [['', '', '', '']]) },
  { id: 'compliance-folder-checklist', title: 'Compliance Folder Checklist', policyIds: ['governance-business'],
    bodyHtml: `<p>Confirm the Compliance Folder contains current evidence of:</p>` +
      ul(['ABN registration', 'NDIS Worker Screening Check clearance', 'Public liability insurance certificate of currency', 'Professional indemnity insurance certificate of currency', 'First aid / CPR certificate', 'Relevant qualifications', 'This policy pack (current version)', 'All completed registers and logs']) },
  { id: 'risk-register', title: 'Risk Register & Assessment Template', policyIds: ['risk-management'],
    bodyHtml: `<p>Assess Likelihood (Rare / Unlikely / Possible / Likely / Almost Certain) x Consequence (Insignificant / Minor / Moderate / Major / Catastrophic) for each identified risk.</p>` +
      table(['Risk', 'Likelihood', 'Consequence', 'Rating', 'Controls', 'Owner', 'Review date'], [['', '', '', '', '', '{{PROVIDER_NAME}}', '']]) },
  { id: 'screening-checklist', title: 'Worker Screening & Qualifications Checklist', policyIds: ['hr-worker-screening'],
    bodyHtml: table(['Item', 'Reference/number', 'Issue date', 'Expiry date', 'Renewed?'],
      [['NDIS Worker Screening Check', '', '', '', ''], ['Working with Children Check (if applicable)', '', '', '', ''], ['First Aid Certificate', '', '', '', ''], ['CPR Certificate', '', '', '', ''], ['Relevant qualification(s)', '', '', '', '']]) },
  { id: 'cpd-log', title: 'Continuing Professional Development (CPD) Log', policyIds: ['hr-worker-screening'],
    bodyHtml: table(['Date', 'Activity/training', 'Provider', 'Duration', 'Key learning'], [['', '', '', '', '']]) },
  { id: 'home-visit-safety-checklist', title: 'Home & Community Visit Safety Checklist', policyIds: ['whs', 'community-access-safety'],
    bodyHtml: `<p>Complete at the first visit to a new location and review annually or after any change.</p>` +
      ul(['Clear, safe access/egress and no obvious trip hazards', 'Working smoke alarm present', 'Pets (if any) safely managed', 'Emergency exits identified', 'Any equipment needed for safe manual handling available', 'Whereabouts/return time noted for community outings', 'Vehicle (if used) registered, insured and roadworthy']) +
      table(['Date', 'Location', 'Hazards noted', 'Action taken', 'Reviewed by'], [['', '', '', '', '{{PROVIDER_NAME}}']]) },
  { id: 'emergency-plan', title: 'Emergency & Disaster Response Plan', policyIds: ['business-continuity'],
    bodyHtml: `<p>Local emergency risks: bushfire / flood / extreme heat / pandemic / power outage (delete as relevant).</p>` +
      ol(['Confirm participant safety and communicate the plan status', 'Activate each participant\'s documented backup arrangement if {{PROVIDER_NAME}} cannot attend', 'Contact emergency services (000) if required', 'Notify support coordinators of any service interruption', 'Resume normal supports once safe, updating participants']) },
  { id: 'continuity-contacts', title: 'Business Continuity Contact List', policyIds: ['business-continuity'],
    bodyHtml: table(['Participant', 'Emergency contact', 'Support coordinator', 'GP', 'Backup support arrangement'], [['', '', '', '', '']]) },
  { id: 'privacy-consent', title: 'Privacy Consent & Information Sharing Form', policyIds: ['privacy-records'],
    bodyHtml: `<p>I consent to {{BUSINESS_NAME}} collecting, storing and using my personal and health information to plan and deliver my supports, and to share relevant information with the people/organisations I list below.</p>` +
      table(['May share with', 'Purpose', 'Participant initials'], [['Support Coordinator', 'Coordination of supports', ''], ['GP / health professional', 'Health and safety', ''], ['Family member / nominee', 'As specified', ''], ['NDIS Quality and Safeguards Commission', 'As required by law', 'N/A — required']]) +
      `<p>Participant/nominee signature: _____________________ Date: {{DATE}}</p>` },
  { id: 'records-schedule', title: 'Records Retention & Disposal Schedule', policyIds: ['privacy-records'],
    bodyHtml: table(['Record type', 'Minimum retention', 'Disposal method'],
      [['Service records (support plans, notes, incident reports)', '7 years from last support provided', 'Secure shred / permanent digital deletion'], ['Financial records (invoices, claims)', '5 years (taxation) / 7 years if also a service record', 'Secure shred / permanent digital deletion'], ['Worker screening / compliance evidence', 'While current + 1 year after renewal or cessation', 'Secure shred / permanent digital deletion']]) },
  { id: 'fee-schedule', title: 'Fee Schedule & NDIS Pricing Schedule Reference', policyIds: ['financial-management'],
    bodyHtml: `<p>Record the NDIS support items delivered and current maximum prices (update whenever the NDIS Pricing Schedule changes, effective 1 July each year — see the NDIA's Annual Pricing Review for the reasoning behind that year's prices).</p>` +
      table(['Support item number', 'Description', 'Unit', 'Price charged', 'Pricing Schedule version used (e.g. 2026-27)'], [['', '', '', '', '']]) },
  { id: 'complaints-register', title: 'Complaints Register', policyIds: ['complaints'],
    bodyHtml: table(['Date received', 'Received from', 'How made', 'Summary', 'Action taken', 'Date resolved', 'Complainant satisfied?'], [['', '', '', '', '', '', '']]) },
  { id: 'incident-report-form', title: 'Incident Report Form', policyIds: ['incident-management', 'whs', 'medication', 'infection-control'],
    bodyHtml: table(['Field', 'Details'],
      [['Date/time of incident', ''], ['Participant(s) involved', ''], ['Location', ''], ['What happened (factual description)', ''], ['Immediate action taken', ''], ['Injuries/harm (if any)', ''], ['Who was notified (participant contact, support coordinator, etc.)', ''], ['Reportable incident? (see checklist)', ''], ['Follow-up / preventive action', ''], ['Completed by', '{{PROVIDER_NAME}}']]) },
  { id: 'reportable-incident-checklist', title: 'Reportable Incident Notification Checklist', policyIds: ['incident-management'],
    bodyHtml: `<p>Check whether the incident matches a reportable category, and how urgently it must be notified to the NDIS Quality and Safeguards Commission.</p>` +
      table(['Category', 'Notify within'],
        [
          ['Death of a participant', '24 hours (priority incident)'],
          ['Serious injury of a participant', '24 hours (priority incident)'],
          ['Abuse or neglect of a participant', '5 business days — 24 hours if there is an ongoing/immediate safety risk'],
          ['Unlawful sexual or physical contact with, or assault of, a participant', '5 business days — 24 hours if there is an ongoing/immediate safety risk'],
          ['Sexual misconduct involving a participant', '5 business days — 24 hours if there is an ongoing/immediate safety risk'],
          ['Unauthorised use of a restrictive practice', '5 business days — 24 hours if it resulted in harm'],
        ]) +
      `<p>If unsure which timeframe applies, use 24 hours. Submit the initial notification via the NDIS Commission Portal by the applicable deadline, then the detailed written report within 5 business days of the initial notification. These categories and timeframes are set by the NDIS Commission — reconfirm at ndiscommission.gov.au if it has been a while since this checklist was last reviewed.</p>` },
  { id: 'restrictive-practice-declaration', title: 'Restrictive Practice Statement / Nil Use Declaration', policyIds: ['restrictive-practices'],
    bodyHtml: `<p>{{BUSINESS_NAME}} confirms that no restrictive practices (seclusion, chemical, mechanical, physical or environmental restraint, or restriction of access to objects) are used in the supports provided to this participant, except where authorised under an NDIS Behaviour Support Plan prepared by a specialist behaviour support practitioner.</p>` +
      `<p>Participant: _____________________ Date: {{DATE}}<br/>Provider signature: {{PROVIDER_NAME}}</p>` },
  { id: 'feedback-log', title: 'Feedback & Compliments Log', policyIds: ['feedback'],
    bodyHtml: table(['Date', 'From', 'Feedback', 'Action taken'], [['', '', '', '']]) },
  { id: 'safeguarding-report', title: 'Safeguarding Concern Report Form', policyIds: ['safeguarding'],
    bodyHtml: table(['Field', 'Details'],
      [['Date/time concern identified', ''], ['Participant', ''], ['Nature of concern (abuse / neglect / exploitation / violence)', ''], ['Source of concern (observed / disclosed / suspected)', ''], ['Immediate action taken to protect participant', ''], ['Escalated to (support coordinator / NDIS Commission / police)', ''], ['Follow-up', '']]) },
  { id: 'transition-checklist', title: 'Transition/Exit Checklist', policyIds: ['access-entry-exit'],
    bodyHtml: ul(['Reason for exit recorded', 'Required notice given (minimum 14 days unless safety emergency)', 'Outstanding invoices finalised', 'Consent obtained for handover summary, if applicable', 'Handover summary provided to new provider/support coordinator', 'Participant records archived per Records Retention Schedule']) },
  { id: 'support-plan-review-log', title: 'Support/Care Plan Review Log', policyIds: ['service-planning'],
    bodyHtml: table(['Review date', 'Changes to NDIS plan/goals?', 'Changes to needs/risks?', 'Plan updated?', 'Next review due'], [['', '', '', '', '']]) },
  { id: 'medication-record', title: 'Medication Administration Record (MAR)', policyIds: ['medication'],
    bodyHtml: table(['Date', 'Time', 'Medication/task', 'Assistance provided', 'Outcome (taken/refused/error)', 'Signed'], [['', '', '', '', '', '{{PROVIDER_NAME}}']]) },
  { id: 'infection-control-checklist', title: 'Infection Control Checklist — Personal Care Visit', policyIds: ['infection-control'],
    bodyHtml: ul(['Hand hygiene performed before and after contact', 'Gloves used for any contact with bodily fluids', 'Waste/sharps disposed of appropriately', 'Equipment (hoist, shower chair, etc.) checked and in safe condition', 'Provider free of transmissible illness, or safe precautions in place']) },
];

const ONBOARDING = [
  { id: 'onboard-checklist', title: 'Onboarding Checklist', order: 0,
    bodyHtml: `<p>Step-by-step process for bringing on a new participant, with the policy each step sits under.</p>` +
      ol([
        'Receive referral — complete Referral &amp; Intake Form <em>(Access, Entry &amp; Exit Policy)</em>',
        'Assess fit against scope, competency and capacity within 5 business days <em>(Access, Entry &amp; Exit Policy)</em>',
        'Complete Initial Assessment &amp; Risk Screening <em>(Risk Management Policy)</em>',
        'Check for any Conflict of Interest and log if found <em>(Conflict of Interest Policy)</em>',
        'Capture NDIS plan details and goals <em>(Person-Centred Planning Policy)</em>',
        'Develop the Individual Support/Care Plan with the participant <em>(Person-Centred Planning Policy)</em>',
        'Obtain signed Privacy Consent <em>(Privacy, Dignity &amp; Records Management Policy)</em>',
        'Issue and sign the Service Agreement with Schedule of Supports &amp; Pricing <em>(Person-Centred Planning Policy)</em>',
        'Sign Restrictive Practice Nil Use Declaration <em>(Restrictive Practices Policy)</em>',
        'Explain rights, Code of Conduct and how to complain <em>(Code of Conduct Policy, Complaints Policy)</em>',
        'Complete Home &amp; Community Visit Safety Checklist at first visit <em>(WHS Policy)</em>',
        'Record backup/continuity arrangement <em>(Business Continuity Policy)</em>',
        'Collect payment/invoicing details <em>(Financial Management Policy)</em>',
        'File everything in the participant’s record and begin supports',
      ]) },
  { id: 'onboard-referral', title: 'Referral & Intake Form', order: 1,
    bodyHtml: table(['Field', 'Details'],
      [['Participant name', ''], ['Date of birth', ''], ['NDIS number', ''], ['Referred by (self / family / support coordinator / other provider)', ''], ['Referrer contact details', ''], ['Supports requested', ''], ['Preferred days/times', ''], ['Any known risks/needs to be aware of', ''], ['Date received', ''], ['Assessed by', '{{PROVIDER_NAME}}'], ['Outcome (accepted / declined / referred elsewhere)', '']]) },
  { id: 'onboard-assessment', title: 'Initial Assessment & Risk Screening Checklist', order: 2,
    bodyHtml: `<p>Complete before or at the first visit.</p>` +
      table(['Area', 'Notes'],
        [['Support needs and preferred routines', ''], ['Communication needs (interpreter, AAC, etc.)', ''], ['Medical conditions / medication support needs', ''], ['Behaviours of concern (if any)', ''], ['Mobility / manual handling needs', ''], ['Home environment hazards', ''], ['Emergency contact', ''], ['Support coordinator / plan manager (if any)', ''], ['Initial risk rating (Low/Medium/High/Extreme)', '']]) },
  { id: 'onboard-plan-goals', title: 'NDIS Plan & Goals Capture Sheet', order: 3,
    bodyHtml: table(['Field', 'Details'],
      [['NDIS plan start/end date', ''], ['Plan management type (self / plan / NDIA-managed)', ''], ['Relevant funded support categories', ''], ['Participant’s stated goals', ''], ['How {{BUSINESS_NAME}}’s supports contribute to these goals', ''], ['Support coordinator/plan manager contact', '']]) },
  { id: 'onboard-support-plan', title: 'Individual Support/Care Plan Template', order: 4,
    bodyHtml: table(['Section', 'Details'],
      [['Participant preferences and routines', ''], ['Goals (from NDIS plan)', ''], ['Supports to be provided and frequency', ''], ['Health/medical information relevant to supports', ''], ['Medication support required (if any)', ''], ['Risks identified and controls', ''], ['Communication needs', ''], ['Cultural, spiritual or language considerations', ''], ['Backup/continuity arrangement', ''], ['Next review date', '']]) },
  { id: 'onboard-service-agreement', title: 'Service Agreement Template (Sole Trader NDIS)', order: 5,
    bodyHtml: `<p>Agreement between {{BUSINESS_NAME}} (ABN {{ABN}}) ("the Provider") and the
      participant named below ("the Participant"), for the provision of NDIS-funded
      supports.</p>` +
      table(['Field', 'Details'],
        [['Participant name', ''], ['NDIS number', ''], ['Start date', ''], ['Review date', '12 months from start, or sooner if plan/needs change'], ['Supports to be provided', 'See attached Schedule of Supports & Pricing'], ['Cancellation policy', 'In line with current NDIS short-notice cancellation rules — explained verbally and provided in writing'], ['How to end this agreement', 'Either party may end this agreement by giving 14 days’ written notice, or immediately in a safety emergency'], ['How to make a complaint', 'Contact {{PROVIDER_NAME}} directly on {{PHONE}} / {{EMAIL}}, or the NDIS Quality and Safeguards Commission on 1800 035 544']]) +
      `<p>Provider signature: {{PROVIDER_NAME}} &nbsp;&nbsp; Date: {{DATE}}<br/>Participant/nominee signature: _____________________ &nbsp;&nbsp; Date: _____________</p>` },
  { id: 'onboard-schedule-supports', title: 'Schedule of Supports & Pricing', order: 6,
    bodyHtml: `<p>Attachment to the Service Agreement.</p>` +
      table(['Support item number', 'Description', 'Frequency', 'Price (per current NDIS Price Guide)'], [['', '', '', '']]) },
  { id: 'onboard-consent', title: 'Participant Consent & Privacy Authority Form', order: 7,
    bodyHtml: `<p>Uses the same content as the Privacy Consent &amp; Information Sharing Form
      in the Governance section — complete and file a signed copy as part of the
      onboarding pack.</p>` },
  { id: 'onboard-payment-details', title: 'Payment & Invoicing Details Form', order: 8,
    bodyHtml: table(['Field', 'Details'],
      [['Plan management type', 'Self-managed / Plan-managed / NDIA-managed'], ['Invoices to be sent to', ''], ['Plan manager name & contact (if plan-managed)', ''], ['Preferred invoice frequency', ''], ['Purchase order / reference required?', '']]) },
];
