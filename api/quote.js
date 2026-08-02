'use strict';

const CONSENT_TEXT = 'I agree to receive recurring conversational text messages from High Alpine Cleaning about my quote, scheduling, service updates, and customer support at the number provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase. Terms: https://highalpinecleaning.com/terms Privacy Policy: https://highalpinecleaning.com/privacy';

function clean(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength)
    : '';
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function validPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

module.exports = async function quote(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const input = req.body && typeof req.body === 'object' ? req.body : {};
  if (clean(input.company, 200)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(input.name, 100);
  const email = clean(input.email, 254).toLowerCase();
  const phone = clean(input.phone, 40);
  const address = clean(input.address, 240);
  const smsConsent = input.sms_consent === true;

  if (!name || !email || !address) {
    return res.status(400).json({ ok: false, error: 'Please include your name, email, and property location.' });
  }
  if (!validEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }
  if (phone && !validPhone(phone)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid phone number or leave it blank.' });
  }
  if (smsConsent && !phone) {
    return res.status(400).json({ ok: false, error: 'Enter a phone number to opt in to text messages.' });
  }

  const webhookUrl = process.env.HIGHLEVEL_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(503).json({ ok: false, error: 'Online requests are being connected. Please email or call us for now.' });
  }

  const submittedAt = new Date().toISOString();
  const payload = {
    first_name: name,
    email,
    phone,
    property_address_or_city: address,
    bedrooms: clean(input.bedrooms, 40),
    bathrooms: clean(input.bathrooms, 40),
    turnovers_per_month: clean(input.turnovers, 60),
    notes: clean(input.notes, 2000),
    lead_source: 'High Alpine Cleaning website',
    submitted_at: submittedAt,
    page_url: clean(input.page_url, 500),
    referrer: clean(input.referrer, 500),
    utm_source: clean(input.utm_source, 120),
    utm_medium: clean(input.utm_medium, 120),
    utm_campaign: clean(input.utm_campaign, 160),
    sms_consent: smsConsent,
    sms_consent_text: smsConsent ? CONSENT_TEXT : '',
    sms_consent_timestamp: smsConsent ? submittedAt : ''
  };

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'HighAlpineCleaning/1.0' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });
    if (!upstream.ok) {
      console.error('HighLevel webhook failed', upstream.status);
      return res.status(502).json({ ok: false, error: 'We could not send your request right now. Please call or email us.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('HighLevel webhook error', error && error.message);
    return res.status(502).json({ ok: false, error: 'We could not send your request right now. Please call or email us.' });
  }
};
