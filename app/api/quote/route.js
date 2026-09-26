import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

const CONSENT_TEXT = 'I agree to receive recurring conversational text messages from High Alpine Cleaning about my quote, scheduling, service updates, and customer support at the number provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase. Terms: https://highalpinecleaning.com/terms Privacy Policy: https://highalpinecleaning.com/privacy';
const attemptsByIp = new Map();

function clean(value, maxLength) { return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength) : ''; }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254; }
function normalizePhone(value) { const digits = value.replace(/\D/g, ''); if (digits.length === 10) return `+1${digits}`; if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`; return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : ''; }
function response(body, status, headers = {}) { return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } }); }
function allowedOrigin(origin) { if (!origin) return true; try { return ['highalpinecleaning.com', 'www.highalpinecleaning.com', 'peak-turnover-cleaning.vercel.app'].includes(new URL(origin).hostname); } catch { return false; } }
function isRateLimited(ip) { const now = Date.now(); const recent = (attemptsByIp.get(ip) || []).filter((timestamp) => now - timestamp < 600000); recent.push(now); attemptsByIp.set(ip, recent); return recent.length > 5; }

async function deliverLead(webhookUrl, payload) {
  let status = 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const upstream = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'HighAlpineCleaning/1.0', 'X-Idempotency-Key': payload.website_lead_id }, body: JSON.stringify(payload), signal: AbortSignal.timeout(5000) });
      status = upstream.status;
      if (upstream.ok) return true;
      if (status < 500) return false;
    } catch { status = 0; }
  }
  console.error('HighLevel webhook failed', status || 'network error', payload.website_lead_id);
  return false;
}

export async function POST(request) {
  if (!allowedOrigin(request.headers.get('origin'))) return response({ ok: false, error: 'Request origin not allowed.' }, 403);
  let input;
  try { input = await request.json(); } catch { input = {}; }
  if (!input || typeof input !== 'object' || JSON.stringify(input).length > 16000) return response({ ok: false, error: 'Request is too large.' }, 413);
  if (clean(input.company, 200)) return response({ ok: true }, 200);
  const ip = clean((request.headers.get('x-forwarded-for') || 'unknown').split(',')[0], 80);
  if (isRateLimited(ip)) return response({ ok: false, error: 'Too many requests. Please call or try again shortly.' }, 429, { 'Retry-After': '600' });
  const name = clean(input.name, 100); const email = clean(input.email, 254).toLowerCase(); const phoneInput = clean(input.phone, 40); const phone = phoneInput ? normalizePhone(phoneInput) : ''; const address = clean(input.address, 240); const smsConsent = input.sms_consent === true || input.sms_consent === 'yes'; const startedAt = Number(clean(input.form_started_at, 30)); const completionMs = startedAt ? Date.now() - startedAt : 0;
  if (!name || !email || !address) return response({ ok: false, error: 'Please include your name, email, and property location.' }, 400);
  if (!validEmail(email)) return response({ ok: false, error: 'Please enter a valid email address.' }, 400);
  if (phoneInput && !phone) return response({ ok: false, error: 'Please enter a valid phone number or leave it blank.' }, 400);
  if (smsConsent && !phone) return response({ ok: false, error: 'Enter a phone number to opt in to text messages.' }, 400);
  if (smsConsent && (clean(input.consent_source, 60) !== 'website_checkbox' || completionMs < 700 || completionMs > 86400000)) return response({ ok: false, error: 'Please confirm text-message consent using the form checkbox.' }, 400);
  const webhookUrl = process.env.HIGHLEVEL_WEBHOOK_URL;
  if (!webhookUrl) return response({ ok: false, error: 'Online requests are being connected. Please email or call us for now.' }, 503);
  const submittedAt = new Date().toISOString();
  const payload = { website_lead_id: crypto.randomUUID(), first_name: name, email, phone, property_address_or_city: address, bedrooms: clean(input.bedrooms, 40), bathrooms: clean(input.bathrooms, 40), turnovers_per_month: clean(input.turnovers, 60), notes: clean(input.notes, 2000), lead_source: 'High Alpine Cleaning website', source_context: clean(input.source_context, 500), submitted_at: submittedAt, page_url: clean(input.page_url, 500), referrer: clean(input.referrer, 500), utm_source: clean(input.utm_source, 120), utm_medium: clean(input.utm_medium, 120), utm_campaign: clean(input.utm_campaign, 160), utm_content: clean(input.utm_content, 160), utm_term: clean(input.utm_term, 120), gclid: clean(input.gclid, 220), gbraid: clean(input.gbraid, 220), wbraid: clean(input.wbraid, 220), msclkid: clean(input.msclkid, 220), sms_consent: smsConsent, sms_consent_source: smsConsent ? clean(input.consent_source, 60) || 'native_web_form' : '', sms_consent_text: smsConsent ? CONSENT_TEXT : '', sms_consent_timestamp: smsConsent ? submittedAt : '' };
  return (await deliverLead(webhookUrl, payload)) ? response({ ok: true }, 200) : response({ ok: false, error: 'We could not send your request right now. Please call or email us.' }, 502);
}
