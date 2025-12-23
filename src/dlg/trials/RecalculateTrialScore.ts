import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TomeTest } from "../../model/TomeTest";
import { TestScorerFactory } from "../../core/Scoring";
import { TrialsStore } from "../../store/TrialsStore";
import { ChallengesStore } from "../../store/ChallengesStore";

/**
 * Util to recalculate the score for a given test answer in a trial.
 */
export class RecalculateTrialScore implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const trialId = req.params.trialId;

        // 1. Validate input 
        if (!trialId) throw new ValidationError(400, "Missing mandatory field: trialId");

        // 2.2. Check how many answers have been submitted for this trial
        const trial = await new TrialsStore(db, execContext).getTrialById(trialId);

        if (!trial) throw new ValidationError(404, `Trial with id ${trialId} not found`);

        // 2. Check if the trial is now complete
        // 2.1. Check how many tests are in the challenge
        const challenge = await new ChallengesStore(db, execContext).getChallengeById(trial?.challengeId);

        const totalTests = challenge?.tests.length || 0;

        const summedScores = trial?.answers?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
        const trialScore = totalTests > 0 ? summedScores / totalTests : 0;

        // 4. Return the result 
        return {
            trialScore: trialScore,
        }
    }

}