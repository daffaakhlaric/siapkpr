
import nodemailer from 'nodemailer';

// ==========================================
// SIAPKPR - LEAD NOTIFICATION EMAIL
// Resend SMTP + Vercel
// ==========================================

// Penerima notifikasi leads
const RECIPIENTS = [
  'marine.novita@gmail.com',
  'robert.halim88@gmail.com',
  'oky.prasetya@gmail.com',
  'daffa.akhlaric52@gmail.com'
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TYPES = {
  '': '-',
  pencari: 'Pencari Properti',
  developer: 'Developer / Pengembang'
};

// ==========================================
// UTILITIES
// ==========================================

function clean(value, max) {
  return typeof value === 'string'
    ? value.trim()
        .slice(0, max)
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
    : '';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

function row(label, valueHtml) {
  return `
    <tr>
      <td style="
        padding:13px 15px;
        background:#F5F8F7;
        border-bottom:1px solid #E6EEEB;
        color:#667875;
        font-size:13px;
        font-weight:600;
        vertical-align:top;
        width:35%;
      ">
        ${escapeHtml(label)}
      </td>
      <td style="
        padding:13px 15px;
        border-bottom:1px solid #E6EEEB;
        color:#17302E;
        font-size:14px;
        line-height:1.6;
        overflow-wrap:anywhere;
      ">
        ${valueHtml}
      </td>
    </tr>
  `;
}

// ==========================================
// HTML EMAIL TEMPLATE
// ==========================================

function makeEmailHtml({
  name,
  email,
  phone,
  tipe,
  message,
  timestamp
}) {

  const site = (
    process.env.SITE_URL || 'https://siapkpr-delta.vercel.app'
  ).replace(/\/+$/, '');

  const logo = `${site}/logo-siapkpr.png`;

  // Format nomor WhatsApp Indonesia
  const wa = phone.replace(/\D/g, '');

  const waNumber = wa.startsWith('0')
    ? `62${wa.slice(1)}`
    : wa;

  const validWhatsApp =
    waNumber.length >= 9 &&
    waNumber.length <= 15 &&
    waNumber.startsWith('62');

  const phoneAction = validWhatsApp
    ? `
      <td style="padding:0 0 0 10px">
        <a
          href="https://wa.me/${waNumber}"
          style="
            display:inline-block;
            padding:13px 19px;
            border-radius:9px;
            background:#183C38;
            color:#ffffff;
            font-size:13px;
            font-weight:700;
            text-decoration:none;
          "
        >
          Hubungi WhatsApp
        </a>
      </td>
    `
    : '';

  const safeMessage = escapeHtml(
    message || '-'
  ).replace(/\r?\n/g, '<br>');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  >
  <title>Lead Baru SiapKPR</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F3F7F6;
  font-family:Arial,Helvetica,sans-serif;
">

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  width="100%"
  style="background:#F3F7F6;padding:28px 12px"
>
<tr>
<td align="center">

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  width="100%"
  style="
    max-width:640px;
    background:#FFFFFF;
    border:1px solid #E3EBE8;
    border-radius:16px;
    overflow:hidden;
  "
>

<!-- HEADER -->
<tr>
<td style="
  padding:28px 32px;
  background:#0B2423;
">

  <img
    src="${escapeHtml(logo)}"
    width="172"
    alt="SiapKPR"
    style="
      display:block;
      width:172px;
      max-width:100%;
      height:auto;
      margin:0 0 22px 0;
      border:0;
    "
  >

  <div style="
    font-size:11px;
    font-weight:700;
    letter-spacing:1.8px;
    color:#72D1C1;
  ">
    NOTIFIKASI LEADS
  </div>

  <h1 style="
    font-size:25px;
    line-height:1.35;
    color:#FFFFFF;
    margin:9px 0 8px;
  ">
    Lead Baru dari Website
  </h1>

  <p style="
    font-size:14px;
    line-height:1.7;
    color:#C5DCD7;
    margin:0;
  ">
    Ada calon pelanggan baru yang mengisi
    formulir SiapKPR.
  </p>

</td>
</tr>

<!-- LEAD INFO -->
<tr>
<td style="padding:30px 32px 14px">

  <p style="
    margin:0 0 5px;
    font-size:12px;
    letter-spacing:1px;
    color:#66817C;
    font-weight:700;
  ">
    INFORMASI PROSPEK
  </p>

  <h2 style="
    margin:0 0 18px;
    font-size:21px;
    color:#153431;
  ">
    ${escapeHtml(name)}
  </h2>

  <table
    role="presentation"
    cellpadding="0"
    cellspacing="0"
    width="100%"
    style="
      border:1px solid #E6EEEB;
      border-collapse:collapse;
    "
  >

    ${row('Nama Lengkap', escapeHtml(name))}

    ${row(
      'Email',
      `<a href="mailto:${escapeHtml(email)}"
         style="color:#087E6D;text-decoration:none">
         ${escapeHtml(email)}
       </a>`
    )}

    ${row(
      'WhatsApp',
      escapeHtml(phone || '-')
    )}

    ${row(
      'Tipe Pelanggan',
      escapeHtml(TYPES[tipe])
    )}

    ${row('Pesan', safeMessage)}

    ${row(
      'Waktu Masuk',
      `${escapeHtml(timestamp)} WIB`
    )}

  </table>

</td>
</tr>

<!-- ACTION BUTTONS -->
<tr>
<td style="padding:12px 32px 32px">

<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
>
<tr>

<td>
  <a
    href="mailto:${escapeHtml(email)}"
    style="
      display:inline-block;
      padding:13px 19px;
      border-radius:9px;
      background:#2DA78F;
      color:#FFFFFF;
      font-size:13px;
      font-weight:700;
      text-decoration:none;
    "
  >
    Balas Email Lead
  </a>
</td>

${phoneAction}

</tr>
</table>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="
  padding:20px 32px;
  background:#F7FAF9;
  border-top:1px solid #E6EEEB;
">

  <p style="
    margin:0;
    color:#6E837E;
    font-size:12px;
    line-height:1.8;
  ">
    Email ini dikirim otomatis dari formulir
    website <strong>SiapKPR</strong>.

    <br>

    Segera lakukan tindak lanjut terhadap
    lead baru ini.
  </p>

</td>
</tr>

</table>

<p style="
  color:#91A39F;
  font-size:11px;
  margin:18px 0 0;
">
  SiapKPR &bull; Notifikasi Website
</p>

</td>
</tr>
</table>

</body>
</html>
`;
}

// ==========================================
// VERCEL API HANDLER
// ==========================================

export default async function handler(req, res) {

  res.setHeader('Cache-Control', 'no-store');

  // Hanya menerima POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Optional origin protection
  if (
    process.env.ALLOWED_ORIGIN &&
    req.headers.origin !== process.env.ALLOWED_ORIGIN
  ) {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed'
    });
  }

  // JSON only
  if (
    !req.headers['content-type']
      ?.toLowerCase()
      .startsWith('application/json')
  ) {
    return res.status(415).json({
      success: false,
      message: 'JSON required'
    });
  }

  // Payload limit
  if (
    Number(req.headers['content-length'] || 0) > 8192
  ) {
    return res.status(413).json({
      success: false,
      message: 'Payload too large'
    });
  }

  const data = req.body || {};

  if (
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payload'
    });
  }

  // Spam honeypot
  if (data.website) {
    return res.status(200).json({
      success: true
    });
  }

  // Validate input types
  if (
    !['name', 'email'].every(
      k => typeof data[k] === 'string'
    ) ||
    !['phone', 'tipe', 'message'].every(
      k =>
        data[k] === undefined ||
        typeof data[k] === 'string'
    )
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data types'
    });
  }

  // Validate input lengths
  if (
    data.name.length > 120 ||
    data.email.length > 254 ||
    (data.phone?.length || 0) > 40 ||
    (data.tipe?.length || 0) > 40 ||
    (data.message?.length || 0) > 2000
  ) {
    return res.status(400).json({
      success: false,
      message: 'Input too long'
    });
  }

  const name = clean(data.name, 120);
  const email = clean(data.email, 254);
  const phone = clean(data.phone, 40);
  const tipe = clean(data.tipe, 40);

  const message =
    typeof data.message === 'string'
      ? data.message.trim().slice(0, 2000)
      : '';

  if (
    !name ||
    !EMAIL_RE.test(email) ||
    !Object.hasOwn(TYPES, tipe)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Nama, email, atau tipe pelanggan tidak valid'
    });
  }

  // ========================================
  // RESEND SMTP CONFIGURATION
  // ========================================

  const apiKey = process.env.RESEND_API_KEY;

  const from =
    process.env.MAIL_FROM ||
    'inquiry@siapkpr.com';

  if (
    !apiKey ||
    !EMAIL_RE.test(from)
  ) {
    return res.status(503).json({
      success: false,
      message: 'Layanan email belum dikonfigurasi'
    });
  }

  try {

    const transporter =
      nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 587,
        secure: false,
        requireTLS: true,

        tls: {
          minVersion: 'TLSv1.2'
        },

        auth: {
          user: 'resend',
          pass: apiKey
        },

        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
      });

    // Timestamp WIB
    const timestamp =
      new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'medium',
        timeZone: 'Asia/Jakarta'
      }).format(new Date());

    // ======================================
    // SEND EMAIL
    // ======================================

    const info = await transporter.sendMail({

      from: {
        name: 'SiapKPR Website',
        address: from
      },

      to: RECIPIENTS,

      replyTo: email,

      subject:
        'SiapKPR - Lead Baru dari Website',

      text: [
        'Ada lead baru dari website SiapKPR',
        '',
        `Nama: ${name}`,
        `Email: ${email}`,
        `WhatsApp: ${phone || '-'}`,
        `Tipe Pelanggan: ${TYPES[tipe]}`,
        `Pesan: ${message || '-'}`,
        `Waktu (WIB): ${timestamp} WIB`
      ].join('\n'),

      html: makeEmailHtml({
        name,
        email,
        phone,
        tipe,
        message,
        timestamp
      })

    });

    // Verify SMTP accepted recipients
    const accepted = new Set(
      (info.accepted || []).map(
        x => x.toLowerCase()
      )
    );

    if (
      RECIPIENTS.some(
        x => !accepted.has(x.toLowerCase())
      )
    ) {
      throw new Error(
        'SMTP did not accept every recipient'
      );
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.error(
      'Resend SMTP delivery error:',
      error?.message || 'Unknown error'
    );

    return res.status(502).json({
      success: false,
      message:
        'Email belum berhasil dikirim, silakan coba lagi'
    });

  }
}
