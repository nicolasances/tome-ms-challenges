import { ValidationError } from "toto-api-controller";
import { TomeChallenge } from "../../model/TomeChallenge";
import { Trial } from "../../model/Trial";

export class TrialScorersConfiguration {

    chosenScorer: "weighted-test-type" | "full-fair" = "weighted-test-type";
    testTypeWeights: {[testType: string]: number} = {};

    static fromHTTPBody(body: any): TrialScorersConfiguration {

        const config = new TrialScorersConfiguration();

        if (!body.chosenScorer) throw new ValidationError(400, "Missing mandatory field: chosenScorer");
        if (!body.testTypeWeights) throw new ValidationError(400, "Missing mandatory field: testTypeWeights");
        
        config.chosenScorer = body.chosenScorer;
        config.testTypeWeights = body.testTypeWeights;
        
        return config;
    }

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
 * IMPORTANT: 
 * if a test type is not present in the given challenge (e.g. a challenge that only has a Open Test), normalize the weights.
 * 
 * Parameters: 
 * - the weights of each type of test in the trials
 */
export class WeightedTestTypeTrialScorer extends TrialScorer {

    async scoreTrial(trial: Trial, challenge: TomeChallenge): Promise<number> {

        // 1. Get the weights
        const weights = this.config.testTypeWeights;

        // 1.1. Make sure that weights sum to 1
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        if (totalWeight !== 1) {
            // Normalize weights
            for (const key of Object.keys(weights)) {
                weights[key] = weights[key] / totalWeight;
            }
        }

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