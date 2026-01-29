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

        return new Settings({
            trialScorerConfiguration: doc.trialScorerConfiguration || new TrialScorersConfiguration(),
        });
    }

    toMongoDoc(): any {
        return {
            trialScorerConfiguration: this.trialScorerConfiguration,
        };
    }
}