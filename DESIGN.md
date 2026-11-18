# Symmetry Explorer — Design Document

> Living design document. The first version was committed at the 30-minute checkpoint and is updated as the build progresses. The final report (all D1–D8 sections with evidence) is in [`report/REPORT.md`](report/REPORT.md).

## Identity card

| Field | Value |
|---|---|
| Application | **Symmetry Explorer** |
| Course | ET617 — End-Semester Examination |
| Roll number / identity token | **24B3941** |
| Problem card | P1 – Context-aware visual learning application |
| Topic | T4 – Symmetry in everyday objects (Class 6–7) |
| Learner context | L1 – Class 6–8 student, rural government school, regional-language medium, parent's Android phone, ~30 min in the evening |
| Design constraint | C2 – Learner's own language (Hindi default, English toggle) |
| Card code | P1-T4-L1-C2 |
| Repository | https://github.com/yug-shaurya/et617-endsem-24b3941 |
| Deployment | https://et617-24b3941.vercel.app |

## D1 — Educational problem

Students often learn symmetry through textbook diagrams but find it hard to recognise symmetry in the objects they see around them. This is especially difficult when learning stays limited to drawing shapes instead of observing real objects, so learners come to believe that anything that "looks balanced" is symmetric and that symmetry lines always run top-to-bottom. Symmetry Explorer lets students explore leaves, flowers, butterflies and everyday objects through photographs, visual comparisons and an interactive fold-and-reflect investigation, all in Hindi. It helps learners see that objects may be perfectly symmetric, approximately symmetric or asymmetric.

**Learning outcomes.** By the end of the activity, the learner will be able to:

1. **Identify** whether an everyday object has line symmetry by examining its two halves.
2. **Locate and draw** a possible line of symmetry, including vertical, horizontal and diagonal lines.
3. **Compare and explain** the difference between perfect, approximate and absent line symmetry.

**Context of use.** At home in a village in the evening, for about 30 minutes, on a parent's shared Android smartphone (Chrome browser, 360–430 px screen), with intermittent mobile data.

## D2 — Learner persona: Asha

| | |
|---|---|
| Name | Asha |
| Age | 12 |
| Class | 7 |
| School | Rural government school, Hindi medium |
| Prior knowledge | Basic shapes (square, rectangle, triangle, circle), dividing a shape into parts, simple mirror reflections |
| Prerequisites | Can read simple Hindi, knows left/right/top/bottom, has folded paper |
| Misconception M1 | *Every object that looks balanced is perfectly symmetrical.* |
| Misconception M2 | *A line of symmetry must always be vertical.* |
| Device | Parent's Android smartphone, shared, no personal account |
| Available time | ~30 minutes in the evening, may be interrupted |
| Language | Hindi (reads slowly in English) |
| Motivation | Curious about patterns in nature, especially leaves, flowers and butterflies |
| Preferences | Short explanations, visual demonstrations, simple Hindi, interactive activities, learning from objects around her |

Design consequences: no login, progress saved on-device, everything works with built-in sample images (no need to take a photo), short screens, Hindi first.

## D3 — Learning activity (plan)

1. **Concept** — "fold test" definition, reflection, vertical/horizontal/diagonal lines, perfect vs approximate vs no symmetry.
2. **Demonstrations** — butterfly (vertical, approximate), rectangle (vertical + horizontal, not diagonal), square (4 lines), leaf (approximate, overlay shows differences).
3. **Six tasks**
   - Q1 Definition — multiple choice.
   - Q2 Leaf — image classification (targets **M1**).
   - Q3 Butterfly axis — multiple choice.
   - Q4 Rectangle axes — multiple select (targets **M2**).
   - Q5 Classify butterfly / stone / square — classification (targets **M1**).
   - Q6 Investigate your own object — interactive axis placement + reasoned classification.
4. Feedback for correct answers and targeted feedback for M1 and M2, with retry.

Full question text, model answers and feedback are in `src/data/questions.ts` and the report.

## D4 — Screen map

```
Welcome ─▶ Home ─┬─▶ Image Source (camera | gallery | sample) ─▶ Preview + AI ─▶ Investigate ─┐
                 ├─▶ Learn (4 demos) ─────────────────────────────────────────────────────────┤
                 ├─▶ Practice (Q1–Q6) ─▶ (Q6 uses Image Source → Investigate) ────────────────┤
                 ├─▶ Progress ◀──────────────────────────────────────────────────────────────┘
                 └─▶ About
```

Routes: `/`, `/home`, `/source`, `/preview`, `/investigate`, `/learn`, `/practice`, `/progress`, `/about`. Identity footer (24B3941, ET617 | P1-T4-L1-C2) on every screen.

## D6 — Initial AI design

- **Feature:** optional object identification for camera/gallery photos (never automatic, never for samples).
- **Route:** `POST /api/analyse-image` (Vercel serverless). The key stays on the server.
- **Input:** downscaled JPEG (≤ 768 px), language (`hi`/`en`).
- **Output:** JSON `{object_name, description, possible_axis, symmetry_observation, confidence, observation_task}`, validated on the server.
- **Fallback:** a fixed bilingual message, manual object choice, and the investigation stays fully usable.
- **Consent:** the learner confirms before the photo is sent.

## D8 — Evaluation plan (outline)

| Outcome | Items | Success |
|---|---|---|
| LO1 Identify | Q2, Q5 | ≥ 2 of 3 Q5 objects correct, and Q2 correct within 2 attempts |
| LO2 Locate/draw | Q3, Q4, Q6 | Q3 correct, Q4 exactly {vertical, horizontal}, Q6 axis placed with similarity estimate computed |
| LO3 Compare/explain | Q2, Q5, Q6 | Distinguishes perfect / approximate / none, and picks an observation-based reason in Q6 |

Logged on-device: question id, answer, correctness, attempt number, time taken, hints, feedback shown, misconception evidence, retry outcome, image source, completion, language.
