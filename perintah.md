# Perintah Refactor Struktur — Event Ku

## Tujuan dan Batasan

Refactor aplikasi Next.js **Event Ku** agar struktur route, halaman, layout, navigasi, authorization, query data, dan test menjadi rapi serta konsisten. Aplikasi harus memiliki dashboard yang benar-benar terpisah untuk empat role: Super Admin, Admin Event, Admin Registrasi, dan Admin Scanner.

Jangan menghapus fitur, business logic, database schema, API contract, QR flow, email flow, import, attendance, export, atau audit log yang sudah ada. Pindahkan dan sesuaikan implementasi yang ada ke struktur baru. Semua fitur harus tetap berfungsi setelah refactor.

Gunakan Next.js App Router + TypeScript. Gunakan `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, dan `route.ts` sesuai kebutuhan. Terapkan authorization di server/API dan Supabase Row Level Security (RLS), bukan hanya dengan menyembunyikan menu UI. Pertahankan branding **Event Ku**.

## Struktur Target Wajib

```text
app/
├── (public)/
│   ├── page.tsx                              # / landing page
│   ├── register/[eventSlug]/page.tsx         # /register/[eventSlug]
│   ├── ticket/[secureToken]/page.tsx         # /ticket/[secureToken]
│   └── privacy-policy/page.tsx               # /privacy-policy
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx                        # /login
│   ├── forgot-password/page.tsx              # /forgot-password
│   └── reset-password/page.tsx               # /reset-password
├── dashboard/
│   ├── page.tsx                              # /dashboard: redirect sesuai role
│   ├── layout.tsx                            # authenticated dashboard shell dasar
│   ├── super-admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # /dashboard/super-admin
│   │   ├── events/page.tsx
│   │   ├── events/new/page.tsx
│   │   ├── events/[eventId]/overview/page.tsx
│   │   ├── events/[eventId]/participants/page.tsx
│   │   ├── events/[eventId]/attendance/page.tsx
│   │   ├── events/[eventId]/emails/page.tsx
│   │   ├── events/[eventId]/broadcasts/page.tsx
│   │   ├── events/[eventId]/reports/page.tsx
│   │   ├── events/[eventId]/settings/page.tsx
│   │   ├── admin-accounts/page.tsx
│   │   ├── global-reports/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   └── settings/page.tsx
│   ├── admin-event/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # /dashboard/admin-event
│   │   └── events/[eventId]/
│   │       ├── overview/page.tsx
│   │       ├── participants/page.tsx
│   │       ├── import/page.tsx
│   │       ├── tickets/page.tsx
│   │       ├── attendance/page.tsx
│   │       ├── scanner/page.tsx
│   │       ├── email-templates/page.tsx
│   │       ├── broadcasts/page.tsx
│   │       ├── team/page.tsx
│   │       ├── reports/page.tsx
│   │       └── settings/page.tsx
│   ├── admin-registrasi/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # /dashboard/admin-registrasi
│   │   └── events/[eventId]/
│   │       ├── participants/page.tsx
│   │       ├── participants/new/page.tsx
│   │       ├── participants/[participantId]/page.tsx
│   │       ├── import/page.tsx
│   │       ├── ticket-status/page.tsx
│   │       └── registration-preview/page.tsx
│   ├── admin-scanner/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # /dashboard/admin-scanner
│   │   └── events/[eventId]/
│   │       ├── scan/page.tsx
│   │       ├── manual-checkin/page.tsx
│   │       └── recent-checkins/page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── api/v1/
│   ├── auth/
│   ├── events/
│   ├── participants/
│   ├── tickets/
│   ├── attendance/
│   ├── imports/
│   ├── emails/
│   ├── broadcasts/
│   ├── reports/
│   └── audit-logs/
├── unauthorized/page.tsx                     # /unauthorized
├── layout.tsx
├── globals.css
├── error.tsx
└── not-found.tsx
```

Endpoint API harus memakai pola App Router, misalnya `app/api/v1/events/route.ts`, `app/api/v1/events/[eventId]/route.ts`, dan `app/api/v1/events/[eventId]/participants/route.ts`.

## Role, Redirect, dan Otorisasi

Gunakan role teknis yang konsisten:

```text
super_admin
event_admin
registration_admin
scanner_admin
```

`/dashboard` wajib redirect di server-side:

| Role | Route tujuan |
|---|---|
| `super_admin` | `/dashboard/super-admin` |
| `event_admin` | `/dashboard/admin-event` |
| `registration_admin` | `/dashboard/admin-registrasi` |
| `scanner_admin` | `/dashboard/admin-scanner` |

Aturan wajib:

1. Pengguna belum login diarahkan ke `/login`.
2. Pengguna yang mengakses dashboard role lain diarahkan ke `/unauthorized`.
3. Super Admin dapat mengakses semua event.
4. Role selain Super Admin harus memiliki event assignment untuk setiap event yang dibaca atau diubah.
5. Setiap route `[eventId]`, API, dan query database memverifikasi role dan assignment. Jangan mempercayai `eventId` dari URL tanpa verifikasi.
6. Bila pengguna memiliki lebih dari satu assignment, sediakan event switcher; hanya event assignment yang boleh tampil dan dipilih.
7. Gunakan RLS Supabase agar data lintas event tidak dapat dibaca atau diubah melalui client/API yang dimanipulasi.

## Dashboard Super Admin

Route: `/dashboard/super-admin`.

Tampilkan total event, event aktif, total peserta seluruh event, total check-in, rata-rata attendance rate, tren registrasi/kehadiran lintas event, event mendatang, performa event, status email global (`queued`, `sent`, `delivered`, `failed`), audit log terbaru, dan notifikasi masalah operasional (email gagal, import gagal, event tanpa Admin Event).

Quick actions: buat event, buat akun admin, kelola event, lihat laporan global.

Sidebar:

```text
Overview
Events
Admin Accounts
Global Reports
Audit Logs
Settings
```

Super Admin event detail memakai route `/dashboard/super-admin/events/[eventId]/{overview,participants,attendance,emails,broadcasts,reports,settings}`.

## Dashboard Admin Event

Route: `/dashboard/admin-event`. Hanya tampilkan event assignment pengguna.

Tampilkan event switcher, informasi event aktif (nama, jadwal, lokasi, status, link registrasi dan tombol salin), KPI total registrasi, tiket aktif, sudah hadir, belum hadir, attendance rate, email gagal/tertunda, grafik registrasi/check-in, peserta terbaru, check-in terbaru, ringkasan broadcast/status email, serta quick actions tambah peserta, import, scanner, broadcast, export, dan kelola tim.

Sidebar:

```text
Overview
Participants
Import
Tickets
Scanner
Attendance
Email Templates
Broadcasts
Team
Reports
Event Settings
```

Seluruh halaman operasional berada di `/dashboard/admin-event/events/[eventId]/...` sesuai struktur target.

## Dashboard Admin Registrasi

Route: `/dashboard/admin-registrasi`. Hanya tampilkan event assignment pengguna.

Tampilkan event switcher, KPI pendaftaran hari ini, total peserta, data perlu diperbaiki, email tiket pending/gagal, import sedang diproses, daftar registrasi terbaru, daftar peserta dengan tiket belum terkirim/gagal, riwayat import sukses/gagal, serta quick actions tambah peserta manual, import Excel/CSV, cari peserta, dan kirim ulang E-Ticket.

Sidebar:

```text
Overview
Participants
Add Participant
Import Participants
Ticket & Email Status
Registration Form Preview
```

Admin Registrasi boleh mengelola peserta, import, melihat status tiket/email, dan mengirim ulang tiket dalam event assignment. Admin Registrasi tidak boleh memiliki menu, page, query, atau API access ke broadcast, event settings, team management, attendance, scanner, laporan global, edit/publish event, maupun pengelolaan akun admin.

## Dashboard Admin Scanner

Route: `/dashboard/admin-scanner`. Dashboard dan halaman scanner harus mobile-first, ringan, dan cepat untuk hari acara.

Tampilkan event selector terbatas pada event assignment, tombol besar **“Mulai Scan QR”**, input kode check-in manual hanya bila `manual_checkin_allowed = true`, KPI total peserta hadir hari ini/target peserta/attendance rate, check-in terbaru, serta status kamera/perangkat/koneksi.

Sidebar:

```text
Overview
Scan QR
Manual Check-in              # tampil hanya jika diizinkan
Recent Check-ins
```

Admin Scanner tidak boleh memiliki menu, page, query, atau API access ke email, broadcast, import, edit event, detail peserta lengkap, manajemen peserta, laporan, pengaturan, ataupun pengelolaan akun admin. Hasil scan hanya boleh menampilkan data minimum untuk validasi: nama peserta, organisasi bila relevan, Guest ID, dan status check-in.

## Komponen Reusable

Gunakan atau refactor komponen bersama tanpa membuat dashboard identik:

```text
components/
├── dashboard/
│   ├── dashboard-shell
│   ├── role-sidebar
│   ├── dashboard-header
│   ├── event-switcher
│   ├── kpi-grid
│   ├── kpi-card
│   ├── chart-card
│   ├── quick-action
│   └── activity-list
├── states/
│   ├── empty-state
│   ├── loading-skeleton
│   ├── error-state
│   └── access-denied-state
└── shared/
    ├── data-table
    ├── status-badge
    ├── confirmation-dialog
    └── pagination
```

Setiap role wajib mempunyai layout/sidebar, navigasi, KPI, quick actions, dan query yang khusus; komponen di atas hanya untuk pola UI yang berulang.

## Fitur Inti yang Tidak Boleh Rusak

Pertahankan dan uji kembali:

- registrasi publik dan validasi peserta;
- struktur data peserta yang sama untuk form, input manual, dan import;
- Guest ID, QR token, serta kode check-in unik;
- QR tanpa data pribadi;
- PDF E-Ticket;
- email queue, status email, retry, dan resend ticket;
- import CSV/XLSX dengan validasi dan laporan error;
- broadcast email;
- check-in atomik dan pencegahan check-in ganda;
- export;
- audit log.

## State UI, Link, dan Dokumentasi

Setiap modul utama wajib memiliki loading skeleton, empty state, error state yang bisa ditindaklanjuti, not-found state, access-denied state, konfirmasi aksi destruktif, toast sukses/gagal, serta status badge konsisten. Perbarui seluruh link internal, breadcrumb, sidebar navigation, metadata, README, dokumentasi route, dan test agar memakai route baru. Jangan sisakan route duplikat atau dead code.

## Test Wajib

Tambahkan atau perbarui test untuk:

1. Redirect `/dashboard` ke dashboard yang benar berdasarkan role.
2. User tidak dapat membuka dashboard role lain.
3. Admin Event, Admin Registrasi, dan Admin Scanner tidak dapat membaca/mengubah event yang tidak ditugaskan.
4. Event switcher hanya menampilkan event assignment pengguna.
5. Admin Registrasi tidak dapat mengakses atau memanggil API broadcast, attendance, scanner, team, event settings, dan laporan global.
6. Admin Scanner tidak dapat mengakses atau memanggil API peserta, email, import, broadcast, reports, dan event settings.
7. Admin Scanner hanya bisa manual check-in saat `manual_checkin_allowed = true`.
8. Semua sidebar/internal link mengarah ke route baru yang tepat.
9. Registrasi, QR, email queue, import, check-in anti-duplikasi, export, dan audit log tetap berfungsi setelah refactor.
10. Dua request check-in bersamaan untuk tiket yang sama menghasilkan tepat satu attendance record.

## Urutan Kerja dan Hasil Akhir

1. Audit struktur project saat ini dan petakan route/fungsi lama ke struktur target.
2. Buat rencana migrasi singkat.
3. Refactor route/layout tanpa menghapus implementasi bisnis yang sudah berfungsi.
4. Perbarui navigation, redirect, middleware/guard, API authorization, dan RLS.
5. Perbarui seluruh link, metadata, dokumentasi, dan test.
6. Jalankan lint, type-check, unit test, integration test, dan end-to-end test yang tersedia.
7. Perbaiki seluruh error maupun regresi.
8. Berikan laporan akhir berisi route yang dibuat/dipindahkan, route lama yang dialihkan/dihapus, perubahan authorization/RLS, test yang ditambahkan, hasil pemeriksaan kualitas, dan konfigurasi eksternal yang masih dibutuhkan.

Jangan menandai pekerjaan selesai sebelum semua route baru dapat diakses sesuai role, seluruh pembatasan authorization berfungsi, dan pemeriksaan kualitas selesai tanpa error.
