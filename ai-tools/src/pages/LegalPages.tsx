import type { ReactNode } from 'react';
import { BRAND } from '../config/brand';
import { Seo } from '../lib/seo';
import { Link } from '../lib/router';

const UPDATED = '31 October 2026';

function Legal({
  title,
  path,
  description,
  children,
}: {
  title: string;
  path: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="prose-simple mx-auto max-w-3xl px-4 py-10">
      <Seo title={`${title} – ${BRAND.name}`} description={description} path={path} />
      <h1>{title}</h1>
      <p className="text-sm text-stone-600">Last updated {UPDATED}</p>
      {children}
    </article>
  );
}

const mail = <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>;

export function TermsPage() {
  return (
    <Legal title="Terms of use" path="/terms" description={`Terms for using ${BRAND.name}.`}>
      <p>
        These terms apply when you buy from {BRAND.name} (“we”, “us”), run by {BRAND.legalName},{' '}
        {BRAND.country}. By paying you agree to them.
      </p>
      <h2>What we provide</h2>
      <p>
        Each tool uses artificial intelligence (AI) to turn the information you give us into a
        document or text, such as a letter. You pay once per purchase. There are no accounts or
        subscriptions.
      </p>
      <h2>Not professional advice</h2>
      <p>
        Our tools are writing aids. They are{' '}
        <strong>not legal, financial, medical or careers advice</strong>, and we cannot promise any
        particular outcome, such as an appeal succeeding. Please read everything before you use it
        and check any deadlines yourself.
      </p>
      <h2>Your responsibilities</h2>
      <ul>
        <li>
          Give accurate information. Tools are designed to use only what you tell us, so the result
          is only as accurate as your input.
        </li>
        <li>Only give other people’s details if you are entitled to.</li>
        <li>Don’t use the tools for anything unlawful, misleading or abusive.</li>
      </ul>
      <h2>AI output</h2>
      <p>
        AI can make mistakes. You are responsible for checking and editing the result before you
        send or rely on it. Each purchase includes one free regeneration.
      </p>
      <h2>Payment and refunds</h2>
      <p>
        Payments are processed by Stripe. See our <Link href="/refunds">refund policy</Link>.
      </p>
      <h2>Ownership</h2>
      <p>
        You may use the documents you buy for any lawful personal purpose. The site, its design and
        its code belong to us.
      </p>
      <h2>Liability</h2>
      <p>
        Nothing in these terms limits your statutory rights as a consumer or our liability where it
        cannot legally be limited. Otherwise our total liability for any purchase is limited to the
        price you paid for it.
      </p>
      <h2>Changes and law</h2>
      <p>
        We may update these terms; the version shown when you buy applies to that purchase. These
        terms are governed by the law of England and Wales, and you may also bring proceedings in
        your home part of the UK.
      </p>
      <p>Questions: {mail}</p>
    </Legal>
  );
}

export function PrivacyPage() {
  return (
    <Legal
      title="Privacy policy"
      path="/privacy"
      description={`How ${BRAND.name} uses and protects your data under UK GDPR.`}
    >
      <p>
        {BRAND.legalName} is the data controller for personal data processed through {BRAND.name}.
        Contact: {mail}.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>What you type or upload into a tool</strong> (for example ticket details, names
          and addresses you include in a letter).
        </li>
        <li>
          <strong>Your email address</strong>, collected at checkout by Stripe, so we can send your
          download link.
        </li>
        <li>
          <strong>Payment details</strong> are handled by Stripe. We never see your full card
          number.
        </li>
        <li>
          <strong>A one-way hash of your IP address</strong>, kept for up to 2 days to stop abuse
          (rate limiting).
        </li>
      </ul>
      <h2>Why we use it (lawful basis)</h2>
      <ul>
        <li>
          To provide what you bought – <em>performance of a contract</em>.
        </li>
        <li>
          To prevent fraud and abuse – <em>legitimate interests</em>.
        </li>
        <li>
          To keep transaction records – <em>legal obligation</em> (held by Stripe).
        </li>
      </ul>
      <p>
        We don’t sell your data, use it for advertising, or use it to train AI models. We don’t use
        it for anything except creating and delivering your order.
      </p>
      <h2>How long we keep it</h2>
      <p>
        <strong>
          Your inputs, results, files and email address are deleted automatically 30 days after your
          order.
        </strong>{' '}
        After that we keep only anonymised statistics (for example: which tool, the price, whether
        it succeeded). Stripe keeps payment records as required by law.
      </p>
      <h2>Who processes it for us</h2>
      <ul>
        <li>
          <strong>Anthropic</strong> – the AI model that writes your document. Your inputs are sent
          to it only after payment.
        </li>
        <li>
          <strong>Supabase</strong> – database and file storage.
        </li>
        <li>
          <strong>Netlify</strong> – website hosting.
        </li>
        <li>
          <strong>Stripe</strong> – payments.
        </li>
        <li>
          <strong>Resend</strong> – sending your download email.
        </li>
      </ul>
      <p>
        Some of these providers are based in, or process data in, the USA. Where data leaves the UK,
        it is protected by appropriate safeguards, such as the UK International Data Transfer
        Addendum or the UK Extension to the EU–US Data Privacy Framework.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        We don’t use advertising or tracking cookies, so there is no cookie banner. We may use
        privacy-friendly, cookie-free analytics (Plausible) that counts page visits without
        identifying you.
      </p>
      <h2>Your rights</h2>
      <p>
        You can ask to access, correct or delete your data, or object to or restrict how we use it.
        Email {mail} with your order email address. You can also complain to the Information
        Commissioner’s Office (ico.org.uk).
      </p>
    </Legal>
  );
}

export function RefundsPage() {
  return (
    <Legal
      title="Refund policy"
      path="/refunds"
      description={`Refunds at ${BRAND.name}: automatic if we can’t create your order.`}
    >
      <h2>If we can’t create your order</h2>
      <p>
        If something goes wrong and we can’t create your document, we{' '}
        <strong>refund you in full automatically</strong> and email you. You don’t need to do
        anything. Refunds usually take 5–10 working days to appear.
      </p>
      <h2>If it isn’t quite right</h2>
      <p>
        Every purchase includes <strong>one free regeneration</strong>. Use the “Regenerate once
        free” button on your results page and tell us what to change.
      </p>
      <h2>If it’s faulty</h2>
      <p>
        If what you receive is faulty or not as described, email {mail} within 30 days with your
        order email and we’ll put it right or refund you. This doesn’t affect your statutory rights.
      </p>
      <h2>Change of mind</h2>
      <p>
        Your document is digital content created for you and supplied straight after payment. When
        you pay, you agree to immediate supply and acknowledge that the usual 14-day right to cancel
        then no longer applies.
      </p>
    </Legal>
  );
}

export function ContactPage() {
  return (
    <Legal title="Contact" path="/contact" description={`Contact ${BRAND.name}.`}>
      <p>
        Email {mail}. Please include the email address you used at checkout. We aim to reply within
        2 working days.
      </p>
      <p>
        Most issues are handled automatically: failed orders are refunded straight away, and each
        purchase includes one free regeneration.
      </p>
    </Legal>
  );
}
