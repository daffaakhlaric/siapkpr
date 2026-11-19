# SiapKPR — Full Project Vercel + Resend SMTP

Project ini mempertahankan HTML asli di folder `public/` (`public/index.html` dan `public/about.html`), dan menggunakan Vercel Function `api/leads.js` untuk mengirim notifikasi form leads melalui **Resend SMTP**. Tidak perlu Microsoft Entra, Outlook SMTP, atau Web3Forms.

## Struktur

```text
public/index.html
public/about.html
api/leads.js
package.json
vercel.json
.env.example
.gitignore
DEPLOY-CEPAT.txt
```

## 1. Siapkan Resend

1. Daftar/login: https://resend.com
2. Buka **Domains** (https://resend.com/domains), tambahkan `siapkpr.id` dan ikuti DNS record yang tampil untuk verifikasi domain.
3. Di provider DNS, tambahkan record verifikasi dan record pengirim Resend **sesuai instruksi dashboard**. Jangan menghapus MX record Microsoft 365 yang sudah ada. Bila Resend meminta MX untuk *subdomain* pengirim seperti `send.siapkpr.id`, itu berbeda dari MX utama `siapkpr.id`; cek nama host sebelum menyimpan.
4. Tunggu sampai dashboard Resend menunjukkan **Verified**.
5. Buka https://resend.com/api-keys dan buat API key **Sending access** (sebaiknya dibatasi ke domain `siapkpr.id`). Salin sekali ke tempat aman.
6. SMTP Resend: Host `smtp.resend.com`, Port `587`, STARTTLS, Username `resend`, Password = API key yang baru dibuat.

## 2. Konfigurasi Vercel

Vercel Dashboard → Project SiapKPR → Settings → Environment Variables → tambahkan:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | API key Resend (rahasia, biasanya awalan `re_`) |
| `MAIL_FROM` | `daffa.akhlaric@siapkpr.id` |
| `ALLOWED_ORIGIN` | (opsional) URL origin production persis, contoh `https://siapkpr.id` |

Jangan menaruh secret di HTML/GitHub. `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `SMTP_HOST`, `SMTP_USER` tidak lagi digunakan dan boleh dihapus dari Vercel setelah cutover sukses.

## 3. Deploy

1. Ekstrak ZIP; upload **isi folder** ini ke root repository (jangan unggah ZIP mentah). Pastikan folder `public/` dan `api/` sejajar di root, bukan `api/` di dalam `public/`.
2. Pada Vercel, import repository GitHub atau deploy ulang project lama. Framework Preset: **Other**; Root Directory: `./`. Jangan atur `next build`.
3. Vercel membaca `package.json` untuk menginstal `nodemailer`, dan membuat function dari `api/leads.js`.
4. Simpan environment variables untuk Production dan redeploy.
5. Uji halaman `/` dan `/about.html`, lalu isi form Hubungi Kami dengan email uji.
6. Pastikan notifikasi diterima `marine.novita@gmail.com`, `robert.halim88@gmail.com`, `oky.prasetya@gmail.com`, dan `daffa.akhlaric52@gmail.com`. Cek juga tab Emails Resend dan Vercel Function Logs.

## 4. Troubleshooting

- **'Layanan email belum dikonfigurasi'**: `RESEND_API_KEY` belum tersedia pada deployment aktif.
- **Rejected sender/domain**: domain `siapkpr.id` belum Verified di Resend atau API key tidak berizin.
- **SMTP authentication failed**: API key keliru atau dicabut; username SMTP harus tepat `resend`.
- **500/502**: lihat log Vercel pada function `/api/leads`.
- **Form terlihat sukses tetapi email tak terlihat**: cek Resend Emails, spam folder, kuota, dan delivery/bounce status. SMTP accepted tidak menjamin delivery ke inbox.
- **404 halaman**: pastikan `public/index.html` dan `public/about.html` ada serta Root Directory Vercel mengarah ke folder yang berisi `public/`, `api/`, dan `package.json`.
- **404 /api/leads**: function tidak terdeploy, periksa folder `api` di root.

## Keamanan sebelum go-live

API telah menggunakan validasi server-side, batas panjang input, honeypot, dan endpoint POST-only. Ini **belum** perlindungan anti-spam lengkap. Aktifkan rate limiting persisten (Redis/Vercel WAF) dan CAPTCHA/Turnstile untuk traffic publik, terutama untuk menghindari penyalahgunaan kuota Resend. `ALLOWED_ORIGIN` membantu membatasi browser biasa, tetapi tidak menggantikan anti-abuse server-side. Hindari logging PII pengunjung. Putar/rotate API key jika bocor.

## Perilaku form

Field Nama dan Email wajib. WhatsApp opsional. Email berisi Nama, Email, WhatsApp, Tipe pelanggan, Pesan, serta waktu WIB. `replyTo` adalah email calon pelanggan, sehingga tim dapat membalas langsung. Satu email ditujukan kepada keempat penerima (semua alamat terlihat di header To).

## Status pengujian

Pemeriksaan kode/sintaks dapat dilakukan tanpa kredensial; **pengiriman email nyata dan Vercel production baru bisa diverifikasi setelah API key dan DNS Resend dikonfigurasi**.
