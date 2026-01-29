import { TrialScorersConfiguration } from "../../core/scorers/TrialScorer";

export class Settings {

    trialScorerConfiguration: TrialScorersConfiguration;

    constructor({trialScorerConfiguration}: {trialScorerConfiguration: TrialScorersConfiguration}) {
        this.trialScorerConfiguration = trialScorerConfiguration;
    }

    static fromMongoDoc(doc: any): Settings {

        if (!doc) return new Settings({
            trialScorerConfiguration: new TrialScorersConfiguration(),
        });

        // Reconstruct TrialScorersConfiguration from the plain object stored in MongoDB
        const config = new TrialScorersConfiguration();
        if (doc.trialScorerConfiguration) {
            config.chosenScorer = doc.trialScorerConfiguration.chosenScorer || "weighted-test-type";
            config.testTypeWeights = doc.trialScorerConfiguration.testTypeWeights || {};
        }

        return new Settings({
            trialScorerConfiguration: config,
        });
    }

    toMongoDoc(): any {
        return {
            trialScorerConfiguration: this.trialScorerConfiguration,
        };
    }
}