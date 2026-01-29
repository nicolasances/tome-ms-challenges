import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { SettingsStore } from "../../store/SettingsStore";
import { Settings } from "../../model/settings/Settings";
import { TrialScorersConfiguration } from "../../core/scorers/TrialScorer";

export class UpdateTrialScorerConfiguration implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<{settings: Settings}> {

        const config = execContext.config as ControllerConfig;

        const trialScorerConfig = TrialScorersConfiguration.fromHTTPBody(req.body);

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        await new SettingsStore(db, execContext).changeTrialScorerConfiguration(trialScorerConfig);

        return {
            settings: await new SettingsStore(db, execContext).loadSettings()
        }
    }
}