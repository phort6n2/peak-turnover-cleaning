'use strict';

const crypto = require('crypto');

const CONSENT_TEXT = 'I agree to receive recurring conversational text messages from High Alpine Cleaning about my quote, scheduling, service updates, and customer support at the number provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase. Terms: https://highalpinecleaning.com/terms Privacy Policy: https://highalpinecleaning.com/privacy';

function clean(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength)
    : '';
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return '';
}

const attemptsByIp = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (attemptsByIp.get(ip) || []).filter((timestamp) => now - timestamp < windowMs);
  recent.push(now);
  attemptsByIp.set(ip, recent);
  if (attemptsByIp.size > 500) {
    for (const [key, timestamps] of attemptsByIp) {
      if (!timestamps.some((timestamp) => now - timestamp < windowMs)) attemptsByIp.delete(key);
    }
  }
  return recent.length > 5;
}

function wantsJson(req) {
  return String(req.headers.accept || '').includes('application/json') ||
    String(req.headers['content-type'] || '').includes('application/json');
}

function sendSuccess(req, res) {
  if (wantsJson(req)) return res.status(200).json({ ok: true });
  res.setHeader('Location', '/thank-you');
  return res.status(303).end();
}

function allowedOrigin(origin) {
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return host === 'highalpinecleaning.com' ||
      host === 'www.highalpinecleaning.com' ||
      host === 'peak-turnover-cleaning.vercel.app';
  } catch (error) {
    return false;
  }
}

async function deliverLead(webhookUrl, payload) {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const upstream = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HighAlpineCleaning/1.0',
          'X-Idempotency-Key': payload.website_lead_id
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });
      lastStatus = upstream.status;
      if (upstream.ok) return { ok: true, status: upstream.status };
      if (upstream.status < 500) return { ok: false, status: upstream.status };
    } catch (error) {
      lastStatus = 0;
    }
    if (attempt === 1) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return { ok: false, status: lastStatus };
}

module.exports = async function quote(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  if (!allowedOrigin(req.headers.origin)) {
    return res.status(403).json({ ok: false, error: 'Request origin not allowed.' });
  }

  const input = req.body && typeof req.body === 'object' ? req.body : {};
  if (JSON.stringify(input).length > 16000) {
    return res.status(413).json({ ok: false, error: 'Request is too large.' });
  }
  if (clean(input.company, 200)) {
    return sendSuccess(req, res);
  }

  const clientIp = clean(String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0], 80);
  if (isRateLimited(clientIp)) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ ok: false, error: 'Too many requests. Please call or try again shortly.' });
  }

  const name = clean(input.name, 100);
  const email = clean(input.email, 254).toLowerCase();
  const phoneInput = clean(input.phone, 40);
  const phone = phoneInput ? normalizePhone(phoneInput) : '';
  const address = clean(input.address, 240);
  const smsConsent = input.sms_consent === true || input.sms_consent === 'yes';
  const consentSource = clean(input.consent_source, 60);
  const startedAt = Number(clean(input.form_started_at, 30));
  const completionMs = startedAt ? Date.now() - startedAt : 0;

  if (!name || !email || !address) {
    return res.status(400).json({ ok: false, error: 'Please include your name, email, and property location.' });
  }
  if (!validEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }
  if (phoneInput && !phone) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid phone number or leave it blank.' });
  }
  if (smsConsent && !phone) {
    return res.status(400).json({ ok: false, error: 'Enter a phone number to opt in to text messages.' });
  }
  if (smsConsent && wantsJson(req) && (consentSource !== 'website_checkbox' || completionMs < 700 || completionMs > 86400000)) {
    return res.status(400).json({ ok: false, error: 'Please confirm text-message consent using the form checkbox.' });
  }

  const webhookUrl = process.env.HIGHLEVEL_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(503).json({ ok: false, error: 'Online requests are being connected. Please email or call us for now.' });
  }

  const submittedAt = new Date().toISOString();
  const websiteLeadId = crypto.randomUUID();
  const payload = {
    website_lead_id: websiteLeadId,
    first_name: name,
    email,
    phone,
    property_address_or_city: address,
    bedrooms: clean(input.bedrooms, 40),
    bathrooms: clean(input.bathrooms, 40),
    turnovers_per_month: clean(input.turnovers, 60),
    notes: clean(input.notes, 2000),
    lead_source: 'High Alpine Cleaning website',
    source_context: clean(input.source_context, 500),
    submitted_at: submittedAt,
    page_url: clean(input.page_url, 500),
    referrer: clean(input.referrer, 500),
    utm_source: clean(input.utm_source, 120),
    utm_medium: clean(input.utm_medium, 120),
    utm_campaign: clean(input.utm_campaign, 160),
    utm_content: clean(input.utm_content, 160),
    utm_term: clean(input.utm_term, 160),
    gclid: clean(input.gclid, 220),
    gbraid: clean(input.gbraid, 220),
    wbraid: clean(input.wbraid, 220),
    msclkid: clean(input.msclkid, 220),
    sms_consent: smsConsent,
    sms_consent_source: smsConsent ? consentSource || 'native_web_form' : '',
    sms_consent_text: smsConsent ? CONSENT_TEXT : '',
    sms_consent_timestamp: smsConsent ? submittedAt : ''
  };

  try {
    const delivery = await deliverLead(webhookUrl, payload);
    if (delivery.ok) return sendSuccess(req, res);
    console.error('HighLevel webhook failed', delivery.status || 'network error', websiteLeadId);
    return res.status(502).json({ ok: false, error: 'We could not send your request right now. Please call or email us.' });
  } catch (error) {
    console.error('HighLevel webhook error', error && error.message, websiteLeadId);
    return res.status(502).json({ ok: false, error: 'We could not send your request right now. Please call or email us.' });
  }
};
