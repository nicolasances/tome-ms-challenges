import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { ChallengesStore } from "../store/ChallengesStore";
import { TomeChallenge } from "../model/TomeChallenge";
import { TrialsStore } from "../store/TrialsStore";

/**
 * Retrieves Challenges. 
 * 
 * Supports the following possibilities: 
 * 1. Get all Challenges for a given Topic. That will extract both Section and Topic Challenges.
 * The list of challenges can be, in this case, enriched with the user's progress/status on each challenge.
 * --- 
 * How is progress and status calculated? 
 * 
 * Each challenge has X trials. Among these X trials, we consider only the Y non-expired trials.
 * Among these Y trials there's going to be: 
 * - YA trials that are completed (have a completedOn date) AND are "attempts" (an attempt is basically a trial that has failed and needs to be retaken)
 * - YB = Max 1 trial that is completed AND not an attempt (successfullyCompletedTrials)
 * - YC trials that are not completed (no completedOn date) 
 * 
 * Status is determined as such:
 * - If YB = 1 then status = "completed"
 * - Otherwise, if YC > 0 then status = "in-progress"
 * - Otherwise status = "not-started"
 * 
 * 2. Get all General Challenges (not yet implemented).
 * 
 */
export class GetChallenges implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<GetTopicChallengesResponse> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const options = GetChallengesOptions.fromHTTPRequest(req);

        const challenges = await new ChallengesStore(db, execContext).getChallenges(options);

        if (options.includeStatus) {

            // 1. Retrieve the user's non-expired trials for these challenges
            const trials = await new TrialsStore(db, execContext).getNonExpiredTrialsOnChallenges(challenges.map(c => c.id!));

            // 2. Map challenges to ExtendedChallenge with status
            const extendedChallenges: ExtendedChallenge[] = challenges.map(challenge => {

                let status: Status = "not-started";

                const successfullyCompletedTrials = trials.filter(trial => trial.challengeId === challenge.id && trial.completedOn != null && trial.completedOn != undefined && !trial.attempt); 

                if (successfullyCompletedTrials.length > 0) {
                    status = "completed";
                }
                else {
                    const openTrials = trials.filter(trial => trial.challengeId === challenge.id && (trial.completedOn == null || trial.completedOn == undefined));

                    if (openTrials.length > 0) {
                        status = "in-progress";
                    }
                }
                
                return {
                    challenge: challenge,
                    status: status
                }
            });

            return { challenges: extendedChallenges };
        }

        return { challenges: challenges };
    }

}

export interface GetTopicChallengesResponse {
    challenges: TomeChallenge[] | ExtendedChallenge[];
}

export interface ExtendedChallenge {
    challenge: TomeChallenge;
    status: Status;
}

type Status = "not-started" | "in-progress" | "completed";

export class GetChallengesOptions {
    includeStatus: boolean = false;
    topicId?: string;

    static fromHTTPRequest(req: Request): GetChallengesOptions {

        const options = new GetChallengesOptions();

        if (req.query.includeStatus && req.query.includeStatus === "true") options.includeStatus = true;
        if (req.query.topicId && typeof req.query.topicId === "string") options.topicId = req.query.topicId;

        return options;
    }
}