import { TrialScorersConfiguration } from "../../core/scorers/TrialScorer";

export class Settings {
    
    trialScorerConfiguration: TrialScorersConfiguration;

    constructor({trialScorerConfiguration}: {trialScorerConfiguration: TrialScorersConfiguration}) {
        this.trialScorerConfiguration = trialScorerConfiguration;
    }

    static fromMongoDoc(doc: any): Settings {
        return new Settings({
            trialScorerConfiguration: doc.trialScorerConfiguration,
        });
    }

    toMongoDoc(): any {
        return {
            trialScorerConfiguration: this.trialScorerConfiguration,
        };
    }
}