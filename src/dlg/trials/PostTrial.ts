import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext } from "totoms";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { TrialFactory } from "../../model/TrialFactory";

/**
 * Creates a new trial for a given Tome Topic and Challenge. 
 */
export class PostTrial extends TotoDelegate<PostTrialRequest, PostTrialResponse> {

    async do(req: PostTrialRequest, userContext?: UserContext): Promise<PostTrialResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());
        const trialsStore = new TrialsStore(db, config);

        // Check if there is an INCOMPLETE, NON-EXPIRED trial for the same challenge. If yes, we do not allow creating a new trial and return that one instead 
        const openNonExpiredTrials = await trialsStore.getOpenNonExpiredTrialsOnChallenges([req.challengeId]);

        if (openNonExpiredTrials && openNonExpiredTrials.length > 0) return { id: openNonExpiredTrials[0].id! };

        // 1 Create and save the trial
        const trial = await new TrialFactory(db, config).newTrial(req.challengeId);

        // 2. Save the trial
        const trialId = await trialsStore.createTrial(trial);

        // 3. Important: if there is an existing COMPLETED trial for the same challenge that is NOT EXPIRED, mark it as "attempt"
        const nonExpiredCompletedTrials = await trialsStore.getCompletedNonExpiredTrialsOnChallenges([req.challengeId]);

        if (nonExpiredCompletedTrials && nonExpiredCompletedTrials.length > 0) {
            await trialsStore.markTrialsAsAttempt(nonExpiredCompletedTrials.map(trial => trial.id!));
        }

        return { id: trialId };
    }

    parseRequest(req: Request): PostTrialRequest {
        return { challengeId: req.body.challengeId };
    }

}

interface PostTrialRequest extends TotoRequest {
    challengeId: string;
}

interface PostTrialResponse {
    id: string;
}