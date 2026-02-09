# Product Overview

## What It Is

A wedding guest photo sharing app. Guests capture moments on their phones, photos go to the couple. No accounts needed.

## Why Build It

- Existing solutions cost money
- Building it is more fun
- Could become a product later

## First Use Case

Cousin's wedding, mid-May 2025.

## Core Value

1. Guests upload photos without creating accounts — just scan a QR code
2. Couple sees everything in one place with full control over visibility
3. Works on any phone via PWA — no app store install required

## What's Built (MVP Complete)

| Capability | Status | Notes |
|-----------|--------|-------|
| Event creation with custom slug/secret | Done | TanStack Form + Zod validation |
| QR code generation + share dialog | Done | qrcode.react |
| Guest camera capture (front/back, zoom) | Done | Full-screen video stream, JPEG 85% |
| Guest name prompt + device tracking | Done | localStorage + deviceId UUID |
| Photo upload to Convex storage | Done | generateUploadUrl → POST → createPhoto |
| Gallery view (grid + list toggle) | Done | Lightbox with nav, download, delete |
| Couple auth via URL secret | Done | `?s=` param → localStorage persistence |
| Per-photo visibility toggle (couple) | Done | Public/private with dimmed UI |
| Photo deletion (couple + guest own) | Done | With confirmation dialog |
| PWA installable | Done | Manifest + service worker shell |
| Dark/light/system theme | Done | next-themes |

## Post-MVP (Completed)

| Capability | Status | Notes |
|-----------|--------|-------|
| Event editing (name, date) | Done | Couple-only dialog from gallery header |

## What It's Not (For Now)

- Not a photo editor
- Not a social network
- No video support
- No AI features
- No user accounts (couple or guest)
- No offline queue (designed but not built)
