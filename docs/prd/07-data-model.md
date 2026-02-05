# Data Model

## AI Usage

Use when generating schemas or database structures.

---

## Event

Fields:

- id
- name
- date
- brandingConfig
- timelineConfig
- settings

---

## Upload

Fields:

- id
- eventId
- guestId
- storageKey
- visibility
- moderationStatus
- tags
- timestamp

---

## Guest

Fields:

- id
- eventId
- name
- participationStats

---

## TimelineSegment

Fields:

- id
- eventId
- startTime
- endTime
- mode

---

## Prompt

Fields:

- id
- eventId
- text
- activeWindow
