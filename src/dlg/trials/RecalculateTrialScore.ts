import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext, ValidationError } from "totoms";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { ChallengesStore } from "../../store/ChallengesStore";
import { TrialScorerFactory } from "../../core/scorers/TrialScorer";
import { SettingsStore } from "../../store/SettingsStore";

/**
 * Util to recalculate the score for a given test answer in a trial.
 */
export class RecalculateTrialScore extends TotoDelegate<RecalculateTrialScoreRequest, RecalculateTrialScoreResponse> {

    async do(req: RecalculateTrialScoreRequest, userContext?: UserContext): Promise<RecalculateTrialScoreResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());

        // 1. Validate input 
        if (!req.trialId) throw new ValidationError(400, "Missing mandatory field: trialId");

        // 2.2. Check how many answers have been submitted for this trial
        const trial = await new TrialsStore(db, config).getTrialById(req.trialId);

        if (!trial) throw new ValidationError(404, `Trial with id ${req.trialId} not found`);

        // 2. Check if the trial is now complete
        // 2.1. Check how many tests are in the challenge
        const challenge = await new ChallengesStore(db, config).getChallengeById(trial?.challengeId);

        const settings = await new SettingsStore(db, config).loadSettings();

        const scorer = TrialScorerFactory.getScorer(settings.trialScorerConfiguration);

        // 4. Return the result 
        return {
            trialScore: await scorer.scoreTrial(trial, challenge!),
        }
    }

    parseRequest(req: Request): RecalculateTrialScoreRequest {
        return { trialId: req.params.trialId };
    }

}

interface RecalculateTrialScoreRequest extends TotoRequest {
    trialId: string;
}

interface RecalculateTrialScoreResponse {
    trialScore: number;
}