# Premium Health Connect — Patient App

## Overview
A premium, Practo-inspired patient-only mobile app built with Expo (React Native) + FastAPI + MongoDB. Light theme with soft blue + mint blended gradients, elevated floating center MyDocs tab, no login flow, seeded demo data.

## Scope (v1)
- No login/signup — direct patient dashboard
- Static demo data seeded to MongoDB on server startup
- 5-tab bottom navigation with elevated center MyDocs FAB

## Screens
1. **Home** — top bar (location + avatar), welcome banner with gradient + heart-rate accent, quick cards (Next Visit / Latest Rx), horizontal specialties row (8), My Doc horizontal list, Health Tips paged carousel
2. **Appointments** — Upcoming / Past segmented tabs, cards with status badge, View / Reschedule / Book Again actions
3. **MyDocs** (center elevated tab) — search + filter chips + full doctor directory
4. **Prescription** — grouped by month, filter chips per doctor, tap to view detail
5. **Profile** — patient hero, stats (Blood / Doctors / Visits), contact card, options list
6. **Doctor Overview** — hero, stats (rating / experience / fee), appointments-till-date, prescriptions from doctor, sticky "Book Again" gradient CTA
7. **Book Appointment** — visit type (In-Clinic / Video), 14-day horizontal date strip, 8 time slots grid, sticky Confirm → confirmation modal
8. **Prescription Detail** — doctor card, diagnosis, medicines (dosage/duration/note), doctor's advice, secure footer

## Backend endpoints (all `/api/*`)
- `GET /patient` — patient profile
- `GET /doctors`, `GET /doctors/{id}`
- `GET /appointments?doctor_id=`, `POST /appointments`
- `GET /prescriptions?doctor_id=`, `GET /prescriptions/{id}`
- `GET /health-tips`

## Seed data
- Patient: Rahul Patil, Pune, Maharashtra (O+)
- 4 doctors: Anjali Mehta (Cardio), Karan Shah (Derma), Neha Kulkarni (GP, initials avatar), Arjun Rao (Neuro)
- 6 appointments (2 upcoming confirmed, 4 completed)
- 4 prescriptions with medicines + diagnosis + advice
- 3 health tips with Unsplash imagery

## Design tokens
- brandPrimary `#2A7AF2`, brandSecondary `#10B981`
- Gradient banner/FAB uses primary → secondary
- Radius: sm 6, md 12, lg 20, xl 28, pill 999
- Typography: Plus Jakarta Sans; weights capped at 500; size denotes hierarchy
- Shadows: soft tier 1

## Tech Stack
- Frontend: Expo SDK 54, expo-router, expo-linear-gradient, expo-image, @expo/vector-icons (Ionicons), dayjs
- Backend: FastAPI, Motor (async MongoDB), Pydantic v2
- Storage: MongoDB (seeds on startup, `_id` excluded)

## Test Coverage
- Backend: 12/12 pytest passing (all endpoints + edge cases)
- Frontend: all screens/flows validated on 390×844 mobile viewport
