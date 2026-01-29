import { ExecutionContext } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { Db } from "mongodb";
import { TrialScorersConfiguration } from "../core/scorers/TrialScorer";

export class SettingsStore {

    settings: any;

    constructor(private db: Db, private execContext: ExecutionContext) {
        this.settings = (execContext.config as ControllerConfig).getCollections().settings;
    }

    /**
     * Loads the settings document from the database.
     */
    async loadSettings(): Promise<any> {

        const doc = await this.db.collection(this.settings).findOne({}) as any;
    }

    /**
     * Updates the trial scorer configuration in the settings document.
     * 
     * @param newConfig the new trial scorer configuration
     */
    async changeTrialScorerConfiguration(newConfig: TrialScorersConfiguration): Promise<void> {

        await this.db.collection(this.settings).updateOne(
            {},
            {
                $set: {
                    trialScorerConfiguration: newConfig
                }
            }
        );
    }

}