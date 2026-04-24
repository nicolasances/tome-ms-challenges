# Microservice Architecture

## Overview

**tome-ms-challenges** is a microservice that manages learning challenges and trials for the Tome knowledge retention platform. It implements a spaced repetition system where users complete challenges to validate their knowledge, with results that expire over time to encourage periodic review.

## Core Concepts

### Challenges

Challenges are learning assessments that test a user's knowledge. Each challenge contains one or more **Tests** that the user must complete.

**Challenge Hierarchy:**

```
TomeChallenge (abstract)
├── TopicChallenge (abstract) - linked to a Topic
│   └── SectionChallenge (abstract) - linked to a specific Section
│       └── JuiceChallenge - tests "juice" (key takeaways) of a section
└── GeneralChallenge (abstract) - spans multiple topics
```

**Challenge Types:**

| Type | Scope | Description |
|------|-------|-------------|
| Topic | Entire topic | Tests holistic understanding of a topic |
| Section | Single section | Tests detailed knowledge within a section |
| General | Cross-topic | Tests ability to connect knowledge across topics |

### Trials

A **Trial** represents a user's attempt to complete a Challenge. It tracks:

- **Start/completion dates**: When the attempt began and ended
- **Expiration date**: When the trial results become invalid
- **Answers**: User responses to each test with individual scores
- **Score**: Final aggregated score (0-100)
- **Attempt flag**: Marks superseded trials when user retries

**Trial Lifecycle:**

```
[Created] → [Answers Submitted] → [Completed] → [Expires]
                                       ↓
                              [New Trial] → marks old as "attempt"
```

### Tests

Tests are individual questions within a Challenge. Each test type has its own scoring mechanism.

| Test Type | Question Format | Scoring Method |
|-----------|-----------------|----------------|
| `open` | Free-text question | LLM evaluation via Gale Agent |
| `date` | Date question | Exact year match |

## Scoring System

### Two-Level Scoring

1. **Test Scoring** (`TestScorer`): Evaluates individual answers
   - `JuiceQuestionScorer`: Uses LLM to compare answer against expected "juice" points
   - `DateScorer`: Checks exact year match (returns 0 or 1)

2. **Trial Scoring** (`TrialScorer`): Aggregates test scores into final trial score
   - `WeightedTestTypeTrialScorer`: Assigns configurable weights per test type

### Weighted Scoring Example

Configuration: `{ "open": 0.6, "date": 0.4 }`

| Test | Type | Score |
|------|------|-------|
| Q1 | open | 80 |
| Q2 | date | 50 |
| Q3 | date | 70 |

**Calculation:**
- Open average: 80
- Date average: (50 + 70) / 2 = 60
- Final: (0.6 × 80) + (0.4 × 60) = 48 + 24 = **72**

**Weight Normalization:** If a challenge lacks certain test types, weights are automatically normalized. A challenge with only `open` tests would use weight 1.0 for open.

## Spaced Repetition

The microservice implements spaced repetition through **Trial Expiration**:

1. Each challenge type defines an expiration period (e.g., JuiceChallenge = 60 days)
2. When a trial is created, `expiresOn` is set based on challenge type
3. Expired trials no longer count as valid knowledge validation
4. Users must re-attempt challenges to maintain validated knowledge

**Attempt Tracking:** When a user starts a new trial for a challenge with an existing valid trial:
- The old trial is marked as `attempt: true`
- This preserves history while tracking the "current" trial

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Challenge  │────▶│    Trial    │────▶│   Answer    │
│  (Tests)    │     │  (User      │     │  (Scored)   │
│             │     │   Attempt)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Trial Score │
                    │ (Weighted)  │
                    └─────────────┘
```

## External Dependencies

- **MongoDB**: Primary data store for challenges, trials, and settings
- **Gale Broker API**: LLM service for evaluating open-text answers
