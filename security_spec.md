# Security Specification & Threat Model for FKP Tasikmalaya

Designed for attribute-based zero-trust security on Cloud Firestore.

## 1. Data Invariants

1. **Owner Immutability**: No PK account or DPD administrator profile can be maliciously updated by anyone who is not explicitly authorized.
2. **DPD Privilege Isolation**: Only the pre-allocated DPD Administrator (`sriwulandari16092000@gmail.com`) is allowed to change organizational profile structures, agenda lists, contacts, or create/delete Kecamatan accounts (`pk_fkp`).
3. **Kecamatan Isolation (PK)**: Any PK (e.g., PK Singaparna) is solely authorized to submit news drafts for their own kecamatan, and manage UMKM entries located strictly under their own kecamatan. They are forbidden from editing or deleting UMKM or news items owned by other kecamatan.
4. **Draft reviews lock**: Once news articles are reviewed or rejected by DPD, secondary PK managers cannot force publish them without DPD administrator consent.

---

## 2. The "Dirty Dozen" Malicious Payloads

We simulate 12 vectors targeting the identity, state, and permissions:

1. **Payload 1 (Privilege Escalation on PK creation)**: An unauthenticated user attempts to write a new `pk_fkp` record designating their own email as leader.
2. **Payload 2 (Admin Profile Poisoning)**: An anonymous user attempts to set `nama_organisasi` to a vulgar term in `profil_organisasi/fkp_dpd_profile_default`.
3. **Payload 3 (The Shadow Update)**: A regular PK user attempts to update a news article and sets `isVerified: true` (a ghost/shadow field not in schema).
4. **Payload 4 (Email Spoofing Attack)**: A user logs in with unverified email account matching `sriwulandari16092000@gmail.com` and tries to delete a Kecamatan profile.
5. **Payload 5 (Cross-Kecamatan News Hijack)**: PK Ciawi attempts to delete or update news written by PK Singaparna.
6. **Payload 6 (No-WhatsApp Poisoning)**: A malicious actor attempts to write a 10MB malicious string into the `no_whatsapp` field of `umkm/someId`.
7. **Payload 7 (Unsigned Draft Hijack)**: An unauthenticated user queries or fetches drafts from the `/berita` subcollection.
8. **Payload 8 (Immortals Bypass)**: PK Singaparna tries to modify the `created_at` timestamp on their PK profile back to 2010.
9. **Payload 9 (Orphaned UMKM Creation)**: A PK attempts to create a UMKM referencing a non-existent kecamatan ID (`pk_id`).
10. **Payload 10 (System-Only Fields Hijack)**: Regular PK attempts to alter a news article's `catatan_review` status from "draft" directly to "published" without going through DPD review.
11. **Payload 11 (Denial of Wallet Query)**: An attacker initiates list query without filtering by `is_active` or ownership, draining query limits.
12. **Payload 12 (ID Poisoning Attack)**: Attacker attempts to target single-document target operations with a 2048-character junk ID string in `/agenda/XYZ...`.

---

## 3. Rules Implementation (Draft)

We will implement complete rules enforcing strict schema and attribute validations.
