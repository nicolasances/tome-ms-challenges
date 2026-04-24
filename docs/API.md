# API Reference

Base path: `/tomechallenges`

## Challenges

### POST /challenges
Creates a new challenge.

**Request Body:**
- `code` (string, required): Challenge type code (e.g., `"juice"`)
- Additional fields depend on challenge type

**Response:** `{ id: string }`

---

### GET /challenges
Retrieves all challenges.

**Response:** `{ challenges: Challenge[] }`

---

### GET /challenges/:challengeId
Retrieves a specific challenge by ID.

**Response:** Challenge object

---

### GET /topics/:topicId/challenges
Retrieves all challenges for a specific topic.

**Response:** `{ challenges: Challenge[] }`

---

## Trials

### POST /trials
Starts a new trial for a challenge. Returns existing open trial if one exists.

**Request Body:**
- `challengeId` (string, required): The challenge to attempt

**Response:** `{ id: string }`

---

### GET /trials
Retrieves all trials.

**Response:** `{ trials: Trial[] }`

---

### GET /trials/:trialId
Retrieves a specific trial by ID.

**Response:** Trial object

---

### DELETE /trials/:trialId
Deletes a specific trial.

**Response:** `{ deleted: true }`

---

### POST /trials/:trialId/answers
Submits an answer for a test within a trial. Scores the answer and marks trial complete when all tests answered.

**Request Body:**
- `test` (object, required): The test being answered (includes `testId`, `type`)
- `answer` (any, required): The user's answer

**Response:**
```json
{
  "score": { "score": number, "details": any },
  "trialScore": number | null,
  "completed": boolean
}
```

---

### GET /trials/:trialId/score
Recalculates and returns the trial score.

**Response:** `{ trialScore: number }`

---

## Settings

### GET /settings
Retrieves current settings including trial scorer configuration.

**Response:** Settings object

---

### PUT /settings/scorers/trial
Updates the trial scorer configuration.

**Request Body:**
- `chosenScorer` (string, required): Scorer type (e.g., `"weighted-test-type"`)
- `testTypeWeights` (object, required): Weight per test type (e.g., `{ "open": 0.6, "date": 0.4 }`)

**Response:** Updated settings object
