import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { TrialFactory } from "../../model/TrialFactory";

/**
 * Creates a new trial for a given Tome Topic and Challenge. 
 */
export class PostTrial implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());
        const trialsStore = new TrialsStore(db, execContext);

        // Check if there is an INCOMPLETE, NON-EXPIRED trial for the same challenge. If yes, we do not allow creating a new trial and return that one instead 
        const openNonExpiredTrials = await trialsStore.getOpenNonExpiredTrialsOnChallenges([req.body.challengeId]);

        if (openNonExpiredTrials && openNonExpiredTrials.length > 0) return { id: openNonExpiredTrials[0].id! };

        // 1 Create and save the trial
        const trial = await new TrialFactory(db, execContext).newTrial(req.body.challengeId);

        // 2. Save the trial
        const trialId = await trialsStore.createTrial(trial);

        // 3. Important: if there is an existing COMPLETED trial for the same challenge that is NOT EXPIRED, mark it as "attempt"
        const nonExpiredCompletedTrials = await trialsStore.getCompletedNonExpiredTrialsOnChallenges([req.body.challengeId]);

        if (nonExpiredCompletedTrials && nonExpiredCompletedTrials.length > 0) {
            await trialsStore.markTrialsAsAttempt(nonExpiredCompletedTrials.map(trial => trial.id!));
        }

        return { id: trialId };
    }

}