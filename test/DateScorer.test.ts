import { expect } from "chai";
import { DateScorer } from "../src/core/scorers/DateScorer";
import { DateTest } from "../src/model/tests/DateTest";

describe("DateScorer", () => {

    let scorer: DateScorer;

    beforeEach(() => {
        scorer = new DateScorer();
    });

    describe("scoreAnswer with exact year match", () => {

        it("should return score 1 for exact year match", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "When was Rome founded?",
                correctAnswer: { year: 753 }
            });

            const result = await scorer.scoreAnswer({ year: 753 }, test, "trial-1");

            expect(result.score).to.equal(1);
        });

        it("should return score 0 for wrong year", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "When was Rome founded?",
                correctAnswer: { year: 753 }
            });

            const result = await scorer.scoreAnswer({ year: 750 }, test, "trial-1");

            expect(result.score).to.equal(0);
        });

        it("should return score 0 when no answer year provided", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "When was Rome founded?",
                correctAnswer: { year: 753 }
            });

            const result = await scorer.scoreAnswer({}, test, "trial-1");

            expect(result.score).to.equal(0);
        });

    });

    describe("scoreAnswer with BCE years (negative)", () => {

        it("should match positive answer to negative correct answer (BCE)", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "When was Rome founded?",
                correctAnswer: { year: -753 }
            });

            // User enters positive 753 but correct answer is -753 (BCE)
            // The scorer uses Math.abs() so this should match
            const result = await scorer.scoreAnswer({ year: 753 }, test, "trial-1");

            expect(result.score).to.equal(1);
        });

        it("should match negative answer to negative correct answer", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "When was Rome founded?",
                correctAnswer: { year: -753 }
            });

            const result = await scorer.scoreAnswer({ year: -753 }, test, "trial-1");

            expect(result.score).to.equal(1);
        });

        it("should match negative answer to positive correct answer", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "When did event X happen?",
                correctAnswer: { year: 753 }
            });

            const result = await scorer.scoreAnswer({ year: -753 }, test, "trial-1");

            expect(result.score).to.equal(1);
        });

    });

    describe("scoreAnswer with null/undefined correct answer", () => {

        it("should return score 0 when correctAnswer.year is undefined", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "When did event X happen?",
                correctAnswer: {}
            });

            const result = await scorer.scoreAnswer({ year: 2000 }, test, "trial-1");

            expect(result.score).to.equal(0);
        });

        it("should return score 0 when correctAnswer.year is null", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "When did event X happen?",
                correctAnswer: { year: null as any }
            });

            const result = await scorer.scoreAnswer({ year: 2000 }, test, "trial-1");

            expect(result.score).to.equal(0);
        });

    });

    describe("scoreAnswer edge cases", () => {

        it("should handle year 0", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "Year zero?",
                correctAnswer: { year: 0 }
            });

            const result = await scorer.scoreAnswer({ year: 0 }, test, "trial-1");

            // Note: year 0 with Math.abs(0) === Math.abs(0) is true
            expect(result.score).to.equal(1);
        });

        it("should handle large years", async () => {
            const test = new DateTest({
                testId: "test-1",
                question: "Far future event?",
                correctAnswer: { year: 3000 }
            });

            const result = await scorer.scoreAnswer({ year: 3000 }, test, "trial-1");

            expect(result.score).to.equal(1);
        });

    });

});
