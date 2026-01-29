import { TomeChallenge } from "../../model/TomeChallenge";
import { Trial } from "../../model/Trial";

export class TrialScorersConfiguration {

    chosenScorer: "weighted-test-type" | "full-fair" = "weighted-test-type";
    testTypeWeights: {[testType: string]: number} = {};

}

export abstract class TrialScorer {

    constructor(protected config: TrialScorersConfiguration) {}

    abstract scoreTrial(trial: Trial, challenge: TomeChallenge): Promise<number>;

}

export class TrialScorerFactory {

    static getScorer(config: TrialScorersConfiguration): TrialScorer {

        switch (config.chosenScorer) {
            case "weighted-test-type":
                return new WeightedTestTypeTrialScorer(config);
            default:
                throw new Error(`Unsupported Trial Scorer type: ${config.chosenScorer}`);
        }
    }
}

/**
 * This scorer assigns weights to different test types. 
 * 
 * For example, let's set the parameters of this scorer to be the following:
 * in a Trial, the sum of the scores of all Juice Open Tests has weight 0.6 and the sum of scores of all Date Tests has weight 0.4.
 * In this case, if a Trial has 1 Open Juice Test with score 80, and 2 Date Test with score 50 and 70, the final score will be:
 * (0.6 * 80) + (0.4 * (50 + 70) / 2) = 48 + 24 = 72
 * 
 * Parameters: 
 * - the weights of each type of test in the trials
 */
export class WeightedTestTypeTrialScorer extends TrialScorer {

    async scoreTrial(trial: Trial, challenge: TomeChallenge): Promise<number> {

        // 1. Get the weights
        const weights = this.config.testTypeWeights;

        // 2. Group scores by test type
        const scoresByType: {[testType: string]: number[]} = {};

        for (const answer of trial.answers || []) {
            const test = challenge.tests.find(t => t.testId === answer.testId);
            const testType = test?.type;
            if (testType) {
                if (!scoresByType[testType]) scoresByType[testType] = [];
                scoresByType[testType].push(answer.score);
            }
        }

        // 3. Average score per test type
        const avgScoresByType: {[testType: string]: number} = {};

        for (const type of Object.keys(weights)) {
            avgScoresByType[type] = (scoresByType[type]?.reduce((a, b) => a + b, 0) || 0) / (scoresByType[type]?.length || 1);
        }

        // 4. Apply weights and sum up for final score
        let finalScore = 0;
        for (const type of Object.keys(weights)) {
            finalScore += (avgScoresByType[type] || 0) * weights[type];
        }

        return finalScore;
    }
}