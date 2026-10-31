import { Resend } from 'resend';
import { envOptional } from './env.ts';
import { BRAND } from '../../src/config/brand.ts';

/**
 * Send an email via Resend. Never throws: email is a backup channel, so a failure
 * is logged but must not break the purchase flow.
 */
export async function sendEmail(to: string | null | undefined, subject: string, html: string) {
  const apiKey = envOptional('RESEND_API_KEY');
  const from = envOptional('FROM_EMAIL');
  if (!to || !apiKey || !from) {
    console.warn('email skipped (missing recipient, RESEND_API_KEY or FROM_EMAIL)');
    return;
  }
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      subject,
      html,
      replyTo: BRAND.contactEmail,
    });
    if (error) console.error('resend error', error);
  } catch (e) {
    console.error('email send failed', e);
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Minimal, inline-styled email layout that renders in every client. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:28px;max-width:560px">
<tr><td><p style="font-size:14px;color:#57534e;margin:0 0 16px">${escapeHtml(BRAND.name)}</p>
<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
${bodyHtml}
<p style="font-size:12px;color:#78716c;margin-top:28px">Questions? Reply to this email or write to ${escapeHtml(BRAND.contactEmail)}.
Your inputs and files are deleted automatically after 30 days.</p></td></tr></table></td></tr></table></body></html>`;
}

export function button(href: string, label: string): string {
  return `<p style="margin:12px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:bold">${escapeHtml(label)}</a></p>`;
}
