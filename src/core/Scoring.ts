import { TotoRuntimeError } from "totoms";
import { TomeChallenge } from "../model/TomeChallenge";
import { TomeTest } from "../model/TomeTest";
import { JuiceQuestionScorer } from "./scorers/JuiceQuestionScorer";
import { DateScorer } from "./scorers/DateScorer";
import { ControllerConfig } from "../Config";

export interface TestScorer<T extends TomeTest> {

    /**
     * Scores a user answer for the given test.
     * 
     * @param answer the user answer   
     * @param test the test to score against
     * @returns a score between 0 and 1
     */
    scoreAnswer(answer: any, test: T, trialId: string): Promise<ScoreResult>;

}

export interface ScoreResult {
    score: number;
    details?: any;
}

/**
 * Factory to create TestScorer instances based on test type.
 */
export class TestScorerFactory {

    static getScorerForTest(test: TomeTest, config: ControllerConfig, cid?: string): TestScorer<TomeTest> {

        switch (test.type) {
            case 'open':
                return new JuiceQuestionScorer(config, cid) as TestScorer<TomeTest>;
            case 'date':
                return new DateScorer() as TestScorer<TomeTest>;
            default:
                throw new TotoRuntimeError(500, `No scorer available for test type: ${test.type}`);
        }
    }
}