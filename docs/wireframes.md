### Medication Manager — ASCII Wireframes

These are quick, text-first wireframes to align on structure and flows. Mobile-first with a bottom tab bar. Not to scale.

## App Navigation Map

```
       +--------------------+
       |      Onboarding    |
       +----------+---------+
                  |
                  v
+------------------+------------------+
|      Today       |      Meds        |
|  (Home/Agenda)   |   (Med List)     |
+----+---------+---+---+----------+---+
     |         |       |          |
     v         v       v          v
  Add Med   Dose Log  Inventory  Settings
     |                     |
     v                     v
  Schedule Builder    Refill Flow
```

Bottom tabs: Today • Meds • Add • Log • Settings

---

## 1) Today (Home)

```
+-----------------------------------+
|  Today                            |
|  Wed, 9:41 AM                     |
|-----------------------------------|
| [Next dose]                        |
|  Metformin 500 mg                 |
|  10:00 AM  • with food            |
|  [Take]  [Snooze 10m]  [Skip]     |
|-----------------------------------|
| Upcoming                          |
|  • Lisinopril 20 mg  12:00 PM     |
|  • Vitamin D 1000 IU  6:00 PM     |
|-----------------------------------|
| Streak: 5 days   On-time: 86%     |
+-----------------------------------+
|  Today   Meds   Add   Log   Gear  |
+-----------------------------------+
```

Key actions: Take/Snooze/Skip, quick view of upcoming doses, adherence at-a-glance.

---

## 2) Meds (Medication List)

```
+-----------------------------------+
|  Medications                      |
|  [Search]   [+ Add]               |
|-----------------------------------|
| Metformin 500 mg                  |
|  Twice daily • w/ food            |
|  Next: 10:00 AM                   |
|  [Details] [Inventory: 18 left]   |
|-----------------------------------|
| Lisinopril 20 mg                  |
|  Daily • AM                       |
|  Next: 12:00 PM                   |
|  [Details] [Inventory: 28 left]   |
|-----------------------------------|
| PRN: Albuterol Inhaler            |
|  Every 4–6h as needed             |
|  [Details] [Usage limits]         |
+-----------------------------------+
```

---

## 3) Add Medication (Flow)

Step A — Entry
```
+-----------------------------------+
|  Add Medication                   |
|-----------------------------------|
| [ Scan Barcode ] [ Import Rx ]    |
| [ Type/Search Name ]              |
|  ⟶ "metformin" results            |
|-----------------------------------|
| Results:                          |
|  • Metformin 500 mg tablet        |
|  • Metformin XR 500 mg tablet     |
|  • …                              |
+-----------------------------------+
```

Step B — Details
```
+-----------------------------------+
|  Metformin 500 mg                 |
|  Form: tablet  Route: PO          |
|  Purpose: Type 2 diabetes         |
|  Prescriber: Dr. Smith            |
|  Notes: w/ food                   |
|  [Continue →]                     |
+-----------------------------------+
```

Step C — Schedule
```
+-----------------------------------+
|  Schedule                         |
|  Type: (• Fixed times  ○ Interval |
|         ○ Cycle  ○ Taper)         |
|  Times: [8:00 AM] [8:00 PM]       |
|  Start: [Today]   End: [None]     |
|  Timezone mode: (• Clock  ○ Interval)
|  [Advanced ▾]                     |
|  [Save]                           |
+-----------------------------------+
```

---

## 4) Schedule Builder (Advanced)

```
+-----------------------------------+
|  Advanced Schedule                |
|-----------------------------------|
| Fixed: M T W T F S S  [✓✓✓✓✓–✓]   |
| Times per day: 2                  |
| Windows: ±30m                     |
| Meal-based: (Before / With / After)
| Interval: every [6] hours         |
| Cycle: 21 days on / 7 off         |
| Taper: week-by-week doses         |
| PRN limits: min [4]h, max [3000]mg/day
|-----------------------------------|
| [Preview]   [Save Schedule]       |
+-----------------------------------+
```

---

## 5) Reminder (Action Sheet / Notification)

```
+-----------------------------------+
|  Time to take: Metformin 500 mg   |
|  Instructions: with food          |
|  [Take Now]  [Snooze 10m ▾]  [Skip]
|  Late? Mark taken at: [9:32 AM ▾] |
|  Notes: [______________________]   |
+-----------------------------------+
```

---

## 6) Dose Log (History)

```
+-----------------------------------+
|  Dose Log                         |
|  Filters: [All] [On-time] [Missed]|
|-----------------------------------|
|  Today                            |
|   ✓ 8:01 AM  Metformin 500 mg     |
|   ○ 12:00 PM Lisinopril 20 mg     |
|  Yesterday                        |
|   ✓ 8:03 PM  Metformin 500 mg     |
|   ✕ 6:15 PM  Vitamin D (missed)   |
|-----------------------------------|
|  Export [PDF] [CSV]               |
+-----------------------------------+
```

---

## 7) Inventory & Refill

```
+-----------------------------------+
|  Inventory                        |
|-----------------------------------|
| Metformin 500 mg                  |
|  18 doses left • ~9 days          |
|  Refill threshold: 10 doses       |
|  Pharmacy: Main St. Pharmacy      |
|  [Request Refill]  [Edit]         |
|-----------------------------------|
| Lisinopril 20 mg                  |
|  28 doses left • ~28 days         |
|  [Auto-refill: ON]                |
+-----------------------------------+
```

Refill flow: threshold reached → prompt on Today + push → one-tap request → status tracking.

---

## 8) Care Team & Sharing

```
+-----------------------------------+
|  Care Team                        |
|-----------------------------------|
| Invite caregiver                  |
|  [ Enter email/phone ] [Send]     |
|  Permissions: View meds ✓  Alerts ✓
|-----------------------------------|
| Share Med List                    |
|  [ Generate link ]  [PDF]         |
+-----------------------------------+
```

---

## 9) Settings

```
+-----------------------------------+
|  Settings                         |
|-----------------------------------|
| Profile & Timezone                |
| Notification preferences          |
| Travel mode (auto plan) [Off ▾]   |
| Safety guardrails                 |
| Backup & Sync                     |
| Privacy & Consents                |
| About                             |
+-----------------------------------+
```

---

## Primary Flows (at a glance)

```
Add Med: Meds → + Add → Search/Scan → Details → Schedule → Save
Take Dose: Today notif → Take Now → Log → Update streaks/next dose
Refill: Inventory threshold → Prompt → Request Refill → Status
Travel: Settings → Travel mode → Select destination/time → Plan doses
```

