import { expect } from "chai";
import { WeightedTestTypeTrialScorer, TrialScorersConfiguration, TrialScorerFactory } from "../src/core/scorers/TrialScorer";
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

        it("should normalize weights when challenge has only date tests", async () => {
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            const challenge = new MockTomeChallenge([
                new MockTomeTest("date", "test-1", "Date question 1"),
                new MockTomeTest("date", "test-2", "Date question 2")
            ]);

            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: [
                    { testId: "test-1", answer: "answer1", score: 100 },
                    { testId: "test-2", answer: "answer2", score: 0 }
                ]
            });

            const score = await scorer.scoreTrial(trial, challenge);

            // Only date tests exist, weight normalized to 1.0
            // Average: (100 + 0) / 2 = 50
            expect(score).to.equal(50);
        });
    });

    describe("scoreTrial edge cases", () => {

        it("should return 0 when trial has no answers", async () => {
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question")
            ]);

            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: []
            });

            const score = await scorer.scoreTrial(trial, challenge);

            expect(score).to.equal(0);
        });

        it("should return 0 when trial answers is undefined", async () => {
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question")
            ]);

            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date()
                // answers is undefined
            });

            const score = await scorer.scoreTrial(trial, challenge);

            expect(score).to.equal(0);
        });

        it("should handle all zero scores", async () => {
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.5,
                "date": 0.5
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question"),
                new MockTomeTest("date", "test-2", "Date question")
            ]);

            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: [
                    { testId: "test-1", answer: "answer1", score: 0 },
                    { testId: "test-2", answer: "answer2", score: 0 }
                ]
            });

            const score = await scorer.scoreTrial(trial, challenge);

            expect(score).to.equal(0);
        });

        it("should handle perfect scores", async () => {
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question"),
                new MockTomeTest("date", "test-2", "Date question")
            ]);

            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: [
                    { testId: "test-1", answer: "answer1", score: 100 },
                    { testId: "test-2", answer: "answer2", score: 100 }
                ]
            });

            const score = await scorer.scoreTrial(trial, challenge);

            // (0.6 * 100) + (0.4 * 100) = 60 + 40 = 100
            expect(score).to.equal(100);
        });

        it("should handle single test type with multiple tests", async () => {
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question 1"),
                new MockTomeTest("open", "test-2", "Open question 2"),
                new MockTomeTest("open", "test-3", "Open question 3")
            ]);

            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: [
                    { testId: "test-1", answer: "answer1", score: 60 },
                    { testId: "test-2", answer: "answer2", score: 80 },
                    { testId: "test-3", answer: "answer3", score: 100 }
                ]
            });

            const score = await scorer.scoreTrial(trial, challenge);

            // Only open tests, normalized weight = 1.0
            // Average: (60 + 80 + 100) / 3 = 80
            expect(score).to.equal(80);
        });

        it("should ignore answers for tests not in challenge", async () => {
            const config = new TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 1.0
            };

            const scorer = new WeightedTestTypeTrialScorer(config);

            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question")
            ]);

            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: [
                    { testId: "test-1", answer: "answer1", score: 70 },
                    { testId: "test-999", answer: "unknown", score: 100 } // This test is not in challenge
                ]
            });

            const score = await scorer.scoreTrial(trial, challenge);

            // Only test-1 should be counted
            expect(score).to.equal(70);
        });

    });

    describe("TrialScorersConfiguration", () => {

        it("should have default values", () => {
            const config = new TrialScorersConfiguration();

            expect(config.chosenScorer).to.equal("weighted-test-type");
            expect(config.testTypeWeights).to.deep.equal({});
        });

        it("should parse from HTTP body", () => {
            const body = {
                chosenScorer: "weighted-test-type",
                testTypeWeights: { "open": 0.7, "date": 0.3 }
            };

            const config = TrialScorersConfiguration.fromHTTPBody(body);

            expect(config.chosenScorer).to.equal("weighted-test-type");
            expect(config.testTypeWeights).to.deep.equal({ "open": 0.7, "date": 0.3 });
        });

        it("should throw when chosenScorer is missing", () => {
            const body = {
                testTypeWeights: { "open": 0.7 }
            };

            expect(() => TrialScorersConfiguration.fromHTTPBody(body)).to.throw("Missing mandatory field: chosenScorer");
        });

        it("should throw when testTypeWeights is missing", () => {
            const body = {
                chosenScorer: "weighted-test-type"
            };

            expect(() => TrialScorersConfiguration.fromHTTPBody(body)).to.throw("Missing mandatory field: testTypeWeights");
        });

        it("should convert to mongo doc", () => {
            const config = new TrialScorersConfiguration();
            config.chosenScorer = "weighted-test-type";
            config.testTypeWeights = { "open": 0.5, "date": 0.5 };

            const doc = config.toMongoDoc();

            expect(doc.chosenScorer).to.equal("weighted-test-type");
            expect(doc.testTypeWeights).to.deep.equal({ "open": 0.5, "date": 0.5 });
        });

        it("should convert to JSON", () => {
            const config = new TrialScorersConfiguration();
            config.chosenScorer = "weighted-test-type";
            config.testTypeWeights = { "open": 0.5, "date": 0.5 };

            const json = config.toJSON();

            expect(json.chosenScorer).to.equal("weighted-test-type");
            expect(json.testTypeWeights).to.deep.equal({ "open": 0.5, "date": 0.5 });
        });

    });

    describe("TrialScorerFactory", () => {

        it("should return WeightedTestTypeTrialScorer for 'weighted-test-type'", () => {
            const config = new TrialScorersConfiguration();
            config.chosenScorer = "weighted-test-type";

            const scorer = TrialScorerFactory.getScorer(config);

            expect(scorer).to.be.instanceOf(WeightedTestTypeTrialScorer);
        });

        it("should throw error for unsupported scorer type", () => {
            const config = new TrialScorersConfiguration();
            (config as any).chosenScorer = "unknown-scorer";

            expect(() => TrialScorerFactory.getScorer(config)).to.throw("Unsupported Trial Scorer type: unknown-scorer");
        });

    });

});
