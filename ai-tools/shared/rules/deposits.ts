/**
 * Tenancy deposit rules per UK nation. STATIC CONFIG shown to the user as "next steps";
 * never written by the AI. Checked 2026-11-05 against:
 *   England: https://www.gov.uk/tenancy-deposit-protection (30 days to protect; return within 10 days
 *            of agreeing; schemes; APTs replaced ASTs on 1 May 2026)
 *            https://www.gov.uk/tenancy-deposit-protection/disputes-and-problems (free dispute service)
 *            https://www.gov.uk/tenancy-deposit-protection/if-your-landlord-doesnt-protect-your-deposit
 *            https://england.shelter.org.uk/housing_advice/tenancy_deposits/how_to_make_a_tenancy_deposit_compensation_claim (1–3x)
 *   Wales:   https://www.gov.wales/deposits-guidance-tenants
 *            https://sheltercymru.org.uk/housing-advice/paying-for-housing/security-deposits/security-deposit-protection-schemes/ (30 days; 1–3x)
 *   Scotland: https://www.mygov.scot/tenant-deposits/protection (30 working days; 3 schemes)
 *            https://www.mygov.scot/tenant-deposits/deposit-not-protected (up to 3x; apply within 3 months of the end)
 *            https://scotland.shelter.org.uk/housing_advice/complaints_and_court/tribunal/how_to_apply (Form F to get a deposit back)
 *   NI:      https://www.nidirect.gov.uk/articles/tenancy-deposit-scheme-information-tenants (28 days; 35 days info;
 *            council can fine 3x; 2 schemes)
 * Re-check every 6 months (see FACTS_TO_VERIFY.md).
 */
export const DEPOSIT_RULES_CHECKED = '2026-11-05';

export type Nation = 'england' | 'wales' | 'scotland' | 'ni';

export interface NationRules {
  label: string;
  schemes: string[];
  protectWithin: string;
  returnRule: string;
  disputeService: string;
  unprotected: string;
  /** Neutral wording for where a claim would go, used ONLY in a letter before action. */
  claimForum: string;
  sources: string[];
}

export const NATIONS: Record<Nation, NationRules> = {
  england: {
    label: 'England',
    schemes: ['Deposit Protection Service', 'mydeposits', 'Tenancy Deposit Scheme'],
    protectWithin:
      'Your landlord or agent must protect your deposit in an approved scheme within 30 days of getting it.',
    returnRule:
      'Your landlord must return your deposit within 10 days of you both agreeing how much you’ll get back.',
    disputeService:
      'If you can’t agree, the deposit scheme offers a free dispute resolution service. You both have to agree to use it, you’ll each give evidence, and its decision is final. You can also raise a dispute with the scheme if you can’t contact your landlord.',
    unprotected:
      'If your deposit wasn’t protected, you can apply to the county court. The court can order the deposit to be repaid and the landlord to pay you between 1 and 3 times the deposit. Get advice (for example from Shelter or Citizens Advice) before going to court.',
    claimForum: 'the county court',
    sources: [
      'https://www.gov.uk/tenancy-deposit-protection',
      'https://www.gov.uk/tenancy-deposit-protection/disputes-and-problems',
      'https://www.gov.uk/tenancy-deposit-protection/if-your-landlord-doesnt-protect-your-deposit',
      'https://england.shelter.org.uk/housing_advice/tenancy_deposits/how_to_make_a_tenancy_deposit_compensation_claim',
    ],
  },
  wales: {
    label: 'Wales',
    schemes: ['Deposit Protection Service', 'mydeposits', 'Tenancy Deposit Scheme'],
    protectWithin:
      'Your landlord must protect your security deposit and give you the required information within 30 days of receiving it.',
    returnRule:
      'There’s no fixed legal deadline in Wales, but GOV.WALES says it usually takes 5 to 10 days to get a deposit back.',
    disputeService:
      'If you can’t agree, contact the deposit protection scheme your landlord used: it offers a free dispute resolution service.',
    unprotected:
      'If your deposit wasn’t protected, you can apply to the county court, which can order it to be protected or returned and award compensation of between 1 and 3 times the deposit. Get advice from Shelter Cymru or Citizens Advice first.',
    claimForum: 'the county court',
    sources: [
      'https://www.gov.wales/deposits-guidance-tenants',
      'https://sheltercymru.org.uk/housing-advice/paying-for-housing/security-deposits/security-deposit-protection-schemes/',
    ],
  },
  scotland: {
    label: 'Scotland',
    schemes: [
      'Letting Protection Service Scotland',
      'mydeposits Scotland',
      'SafeDeposits Scotland',
    ],
    protectWithin:
      'Your landlord must protect your deposit in one of 3 approved schemes within 30 working days of the tenancy starting.',
    returnRule:
      'At the end of the tenancy, the deposit is repaid through the scheme. If it isn’t returned, you can also apply to the First-tier Tribunal for Scotland (Housing and Property Chamber).',
    disputeService:
      'If you disagree about deductions, the scheme offers a free dispute resolution service.',
    unprotected:
      'If your deposit wasn’t protected, you can apply to the First-tier Tribunal for Scotland (Housing and Property Chamber) during the tenancy or up to 3 months after it ends. It can order compensation of up to 3 times the deposit. There’s no fee to apply.',
    claimForum: 'the First-tier Tribunal for Scotland (Housing and Property Chamber)',
    sources: [
      'https://www.mygov.scot/tenant-deposits/protection',
      'https://www.mygov.scot/tenant-deposits/deposit-not-protected',
      'https://scotland.shelter.org.uk/housing_advice/complaints_and_court/tribunal/how_to_apply',
    ],
  },
  ni: {
    label: 'Northern Ireland',
    schemes: ['Tenancy Deposit Scheme Northern Ireland', 'My Deposits Northern Ireland'],
    protectWithin:
      'Your landlord must protect your deposit within 28 days of receiving it, and give you written information about it within 35 days.',
    returnRule:
      'At the end of the tenancy, the deposit is repaid through the scheme, which can tell you how to raise a disagreement.',
    disputeService:
      'If you disagree about deductions, contact the scheme protecting your deposit about its dispute service.',
    unprotected:
      'If your deposit wasn’t protected in time, you can contact the Environmental Health Office at your local council. A council can fine the landlord 3 times the deposit.',
    claimForum: 'the court',
    sources: ['https://www.nidirect.gov.uk/articles/tenancy-deposit-scheme-information-tenants'],
  },
};

export type LetterType = 'request' | 'dispute' | 'before_action';

export const LETTER_TYPE_LABEL: Record<LetterType, string> = {
  request: 'Request for return of deposit',
  dispute: 'Dispute of proposed deductions',
  before_action: 'Letter before action',
};

/**
 * Chosen in code, never by the AI:
 *  - letter before action if they've already asked twice or more, or the deposit wasn't protected;
 *  - dispute of deductions if the landlord proposed deductions;
 *  - otherwise a request for return.
 */
export function chooseLetterType(v: {
  timesAsked: 'none' | 'once' | 'twice';
  protectedStatus: 'yes' | 'no' | 'unknown';
  deductions: unknown[];
}): LetterType {
  if (v.timesAsked === 'twice' || v.protectedStatus === 'no') return 'before_action';
  if (v.deductions.length > 0) return 'dispute';
  return 'request';
}

/** Days given in every letter for a reply (Shelter Cymru: a letter before action allows at least 14 days). */
export const DEPOSIT_REPLY_DAYS = 14;

export function depositNextSteps(
  nation: Nation,
  protectedStatus: 'yes' | 'no' | 'unknown',
): string[] {
  const n = NATIONS[nation];
  const steps = [
    'Send the letter by email and keep a copy. If you post it, get proof of postage.',
    n.returnRule,
    n.disputeService,
    n.protectWithin,
  ];
  if (protectedStatus !== 'yes')
    steps.push(
      `Check whether your deposit is protected by contacting the schemes: ${n.schemes.join(', ')}.`,
      n.unprotected,
    );
  steps.push(
    'Free advice: Citizens Advice, or Shelter (England), Shelter Cymru or Shelter Scotland.',
  );
  return steps;
}

export const DEPOSIT_DISCLAIMER = 'This is a letter-writing tool, not legal advice.';
