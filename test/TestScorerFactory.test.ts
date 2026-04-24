import { expect } from "chai";
import { describe, it } from "mocha";
import { TestScorerFactory } from "../src/core/Scoring";
import { JuiceQuestionScorer } from "../src/core/scorers/JuiceQuestionScorer";
import { DateScorer } from "../src/core/scorers/DateScorer";
import { TomeTest } from "../src/model/TomeTest";

// Mock test classes for testing
class MockOpenTest extends TomeTest {
    type = "open";
    testId = "test-1";
    question = "Open question?";
}

class MockDateTest extends TomeTest {
    type = "date";
    testId = "test-2";
    question = "Date question?";
}

class MockUnknownTest extends TomeTest {
    type = "unknown";
    testId = "test-3";
    question = "Unknown question?";
}

// Mock config for JuiceQuestionScorer
const mockConfig = {} as any;

describe("TestScorerFactory", () => {

    describe("getScorerForTest", () => {

        it("should return JuiceQuestionScorer for 'open' test type", () => {
            const test = new MockOpenTest();

            const scorer = TestScorerFactory.getScorerForTest(test, mockConfig);

            expect(scorer).to.be.instanceOf(JuiceQuestionScorer);
        });

        it("should return DateScorer for 'date' test type", () => {
            const test = new MockDateTest();

            const scorer = TestScorerFactory.getScorerForTest(test, mockConfig);

            expect(scorer).to.be.instanceOf(DateScorer);
        });

        it("should throw error for unknown test type", () => {
            const test = new MockUnknownTest();

            expect(() => TestScorerFactory.getScorerForTest(test, mockConfig)).to.throw("No scorer available for test type: unknown");
        });

    });

});
