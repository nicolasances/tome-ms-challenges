import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext, Logger } from "totoms";
import { ControllerConfig } from "../../Config";
import { SettingsStore } from "../../store/SettingsStore";
import { Settings } from "../../model/settings/Settings";
import { TrialScorerFactory, TrialScorersConfiguration } from "../../core/scorers/TrialScorer";
import { TrialsStore } from "../../store/TrialsStore";
import { FindCursor } from "mongodb";
import { Trial } from "../../model/Trial";
import { ChallengesStore } from "../../store/ChallengesStore";

export class UpdateTrialScorerConfiguration extends TotoDelegate<UpdateTrialScorerConfigurationRequest, UpdateTrialScorerConfigurationResponse> {

    async do(req: UpdateTrialScorerConfigurationRequest, userContext?: UserContext): Promise<UpdateTrialScorerConfigurationResponse> {

        const config = this.config as ControllerConfig;
        const logger = Logger.getInstance();
        const cid = this.cid;

        const db = await config.getMongoDb(config.getDBName());

        await new SettingsStore(db, config).changeTrialScorerConfiguration(req.trialScorerConfig);

        // Recompute and update all Trials scores
        // 1. Load trials and challenges
        const trialsCursor: FindCursor<any> = new TrialsStore(db, config).getTrials();   
        const challenges = await new ChallengesStore(db, config).getChallenges()
        const scorer = TrialScorerFactory.getScorer(req.trialScorerConfig);

        // 2. For each trial, recompute the score using the new configuration
        const trialScores: { trialId: string; score: number }[] = [];

        for await (const trialDoc of trialsCursor) {

            const trial = Trial.fromMongoDoc(trialDoc);
            const challenge = challenges.find(c => c.id === trial.challengeId);

            if (!challenge) continue; 

            const newScore = await scorer.scoreTrial(trial, challenge);

            trialScores.push({ trialId: trial.id!, score: newScore });
        }

        // 3. Update the trials scores
        const updateResult = await new TrialsStore(db, config).updateTrialsScores(trialScores);

        logger.compute(cid, `Updated scores for ${updateResult.modifiedCount} trials after trial scorer configuration change.`);

        return {
            settings: await new SettingsStore(db, config).loadSettings(), 
        }
    }

    parseRequest(req: Request): UpdateTrialScorerConfigurationRequest {
        return { trialScorerConfig: TrialScorersConfiguration.fromHTTPBody(req.body) };
    }

}

interface UpdateTrialScorerConfigurationRequest extends TotoRequest {
    trialScorerConfig: TrialScorersConfiguration;
}

interface UpdateTrialScorerConfigurationResponse {
    settings: Settings;
}