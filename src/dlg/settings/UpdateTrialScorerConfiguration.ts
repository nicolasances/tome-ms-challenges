import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { SettingsStore } from "../../store/SettingsStore";
import { Settings } from "../../model/settings/Settings";
import { TrialScorerFactory, TrialScorersConfiguration } from "../../core/scorers/TrialScorer";
import { TrialsStore } from "../../store/TrialsStore";
import { FindCursor } from "mongodb";
import { Trial } from "../../model/Trial";
import { ChallengesStore } from "../../store/ChallengesStore";

export class UpdateTrialScorerConfiguration implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<{settings: Settings}> {

        const config = execContext.config as ControllerConfig;
        const logger = execContext.logger;
        const cid = execContext.cid;

        const trialScorerConfig = TrialScorersConfiguration.fromHTTPBody(req.body);

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        await new SettingsStore(db, execContext).changeTrialScorerConfiguration(trialScorerConfig);

        // Recompute and update all Trials scores
        // 1. Load trials and challenges
        const trialsCursor: FindCursor<any> = new TrialsStore(db, execContext).getTrials();   
        const challenges = await new ChallengesStore(db, execContext).getChallenges()
        const scorer = TrialScorerFactory.getScorer(trialScorerConfig);

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
        const updateResult = await new TrialsStore(db, execContext).updateTrialsScores(trialScores);

        logger.compute(cid, `Updated scores for ${updateResult.modifiedCount} trials after trial scorer configuration change.`);

        return {
            settings: await new SettingsStore(db, execContext).loadSettings(), 
        }
    }
}