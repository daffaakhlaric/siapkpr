import nodemailer from 'nodemailer';

const RECIPIENTS = [
  'marine.novita@gmail.com',
  'robert.halim88@gmail.com',
  'oky.prasetya@gmail.com',
  'daffa.akhlaric52@gmail.com'
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedTypes = new Set(['', 'pencari', 'developer']);

function clean(value, max) {
  return typeof value === 'string'
    ? value.trim().slice(0, max).replace(/[\u0000-\u001f\u007f]/g, ' ')
    : '';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  if (process.env.ALLOWED_ORIGIN && req.headers.origin !== process.env.ALLOWED_ORIGIN) {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    return res.status(415).json({ success: false, message: 'JSON required' });
  }
  if (Number(req.headers['content-length'] || 0) > 8192) {
    return res.status(413).json({ success: false, message: 'Payload too large' });
  }
  const data = req.body || {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
  if (data.website) return res.status(200).json({ success: true }); // Honeypot.
  if (!['name', 'email'].every(k => typeof data[k] === 'string') ||
      !['phone', 'tipe', 'message'].every(k => data[k] === undefined || typeof data[k] === 'string')) {
    return res.status(400).json({ success: false, message: 'Invalid data types' });
  }
  if (data.name.length > 120 || data.email.length > 254 ||
      (data.phone?.length || 0) > 40 || (data.tipe?.length || 0) > 40 ||
      (data.message?.length || 0) > 2000) {
    return res.status(400).json({ success: false, message: 'Input too long' });
  }
  const name = clean(data.name, 120);
  const email = clean(data.email, 254);
  const phone = clean(data.phone, 40);
  const tipe = clean(data.tipe, 40);
  const message = clean(data.message, 2000);
  if (!name || !EMAIL_RE.test(email) || !allowedTypes.has(tipe)) {
    return res.status(400).json({ success: false, message: 'Nama, email, atau tipe pelanggan tidak valid' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'daffa.akhlaric@siapkpr.id';
  if (!apiKey || !EMAIL_RE.test(from)) {
    return res.status(503).json({ success: false, message: 'Layanan email belum dikonfigurasi' });
  }
  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.resend.com', port: 587, secure: false, requireTLS: true,
      tls: { minVersion: 'TLSv1.2' },
      auth: { user: 'resend', pass: apiKey },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000
    });
    const timestamp = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long', timeStyle: 'long', timeZone: 'Asia/Jakarta'
    }).format(new Date());
    const result = await transport.sendMail({
      from: { name: 'SiapKPR Website', address: from },
      to: RECIPIENTS,
      replyTo: email,
      subject: 'SiapKPR - Lead Baru dari Website',
      text: [
        'Ada lead baru dari website SiapKPR', '',
        `Nama: ${name}`, `Email: ${email}`, `WhatsApp: ${phone || '-'}`,
        `Tipe Pelanggan: ${tipe === 'pencari' ? 'Pencari Properti' : tipe === 'developer' ? 'Developer / Pengembang' : '-'}`,
        `Pesan: ${message || '-'}`, `Waktu (WIB): ${timestamp}`
      ].join('\n')
    });
    const accepted = new Set((result.accepted || []).map(x => x.toLowerCase()));
    if (RECIPIENTS.some(x => !accepted.has(x.toLowerCase()))) {
      throw new Error('SMTP did not accept every recipient');
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend SMTP delivery error:', error?.message || 'Unknown error');
    return res.status(502).json({ success: false, message: 'Email belum berhasil dikirim, silakan coba lagi' });
  }
}
