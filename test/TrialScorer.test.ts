import { expect } from "chai";
import { WeightedTestTypeTrialScorer, TrialScorersConfiguration } from "../src/core/scorers/TrialScorer";
import { TomeChallenge } from "../src/model/TomeChallenge";
import { TomeTest } from "../src/model/TomeTest";
import { Trial, TestAnswer } from "../src/model/Trial";

// Mock implementations for testing
class MockTomeTest extends TomeTest {
    type: string;
    testId: string;
    question: string;

    constructor(type: string, testId: string, question: string) {
        super();
        this.type = type;
        this.testId = testId;
        this.question = question;
    }
}

class MockTomeChallenge extends TomeChallenge {
    type: "topic" | "section" | "general" = "general";
    code: string = "test-challenge";
    name: string = "Test Challenge";
    description: string = "A test challenge";
    tests: TomeTest[];

    constructor(tests: TomeTest[]) {
        super();
        this.tests = tests;
    }

    toMongoDoc(): any {
        return {};
    }
}

describe("WeightedTestTypeTrialScorer", () => {

    describe("scoreTrial with both test types present", () => {
        it("should correctly calculate weighted score with 0.6 weight for open and 0.4 for date", async () => {
            // Setup configuration
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            // Create challenge with 1 open test and 2 date tests
            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question"),
                new MockTomeTest("date", "test-2", "Date question 1"),
                new MockTomeTest("date", "test-3", "Date question 2")
            ]);

            // Create trial with answers
            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: [
                    { testId: "test-1", answer: "answer1", score: 80 },
                    { testId: "test-2", answer: "answer2", score: 50 },
                    { testId: "test-3", answer: "answer3", score: 70 }
                ]
            });

            // Calculate score
            const score = await scorer.scoreTrial(trial, challenge);

            // Expected: (0.6 * 80) + (0.4 * (50 + 70) / 2) = 48 + 24 = 72
            expect(score).to.equal(72);
        });
    });

    describe("scoreTrial with weight normalization", () => {
        it("should normalize weights when challenge has only open test", async () => {
            // Setup configuration with both test types
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            // Create challenge with only 1 open test (no date tests)
            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question")
            ]);

            // Create trial with answer
            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: [
                    { testId: "test-1", answer: "answer1", score: 80 }
                ]
            });

            // Calculate score
            const score = await scorer.scoreTrial(trial, challenge);

            // Expected: Since only open test exists, its weight should be normalized to 1.0
            // Score = 1.0 * 80 = 80
            expect(score).to.equal(80);
        });
    });

});
