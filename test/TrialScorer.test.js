"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const TrialScorer_1 = require("../src/core/scorers/TrialScorer");
const TomeChallenge_1 = require("../src/model/TomeChallenge");
const TomeTest_1 = require("../src/model/TomeTest");
const Trial_1 = require("../src/model/Trial");
// Mock implementations for testing
class MockTomeTest extends TomeTest_1.TomeTest {
    constructor(type, testId, question) {
        super();
        this.type = type;
        this.testId = testId;
        this.question = question;
    }
}
class MockTomeChallenge extends TomeChallenge_1.TomeChallenge {
    constructor(tests) {
        super();
        this.type = "general";
        this.code = "test-challenge";
        this.name = "Test Challenge";
        this.description = "A test challenge";
        this.tests = tests;
    }
    toMongoDoc() {
        return {};
    }
}
describe("WeightedTestTypeTrialScorer", () => {
    describe("scoreTrial with both test types present", () => {
        it("should correctly calculate weighted score with 0.6 weight for open and 0.4 for date", () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup configuration
            const config = new TrialScorer_1.TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };
            const scorer = new TrialScorer_1.WeightedTestTypeTrialScorer(config);
            // Create challenge with 1 open test and 2 date tests
            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question"),
                new MockTomeTest("date", "test-2", "Date question 1"),
                new MockTomeTest("date", "test-3", "Date question 2")
            ]);
            // Create trial with answers
            const trial = new Trial_1.Trial({
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
            const score = yield scorer.scoreTrial(trial, challenge);
            // Expected: (0.6 * 80) + (0.4 * (50 + 70) / 2) = 48 + 24 = 72
            (0, chai_1.expect)(score).to.equal(72);
        }));
    });
    describe("scoreTrial with weight normalization", () => {
        it("should normalize weights when challenge has only open test", () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup configuration with both test types
            const config = new TrialScorer_1.TrialScorersConfiguration();
            config.testTypeWeights = {
                "open": 0.6,
                "date": 0.4
            };
            const scorer = new TrialScorer_1.WeightedTestTypeTrialScorer(config);
            // Create challenge with only 1 open test (no date tests)
            const challenge = new MockTomeChallenge([
                new MockTomeTest("open", "test-1", "Open question")
            ]);
            // Create trial with answer
            const trial = new Trial_1.Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date(),
                answers: [
                    { testId: "test-1", answer: "answer1", score: 80 }
                ]
            });
            // Calculate score
            const score = yield scorer.scoreTrial(trial, challenge);
            // Expected: Since only open test exists, its weight should be normalized to 1.0
            // Score = 1.0 * 80 = 80
            (0, chai_1.expect)(score).to.equal(80);
        }));
    });
});
