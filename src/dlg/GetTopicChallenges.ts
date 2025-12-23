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
 * 1. Get all Challenges for a give Topic. That will extract both Section and Topic Challenges.
 * 2. Get all General Challenges (not yet implemented).
 * 
 */
export class GetTopicChallenges implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<GetTopicChallengesResponse> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const options = GetChallengesOptions.fromHTTPRequest(req);

        const challenges = await new ChallengesStore(db, execContext).getChallengesOfTopic(req.params.topicId);

        if (options.includeStatus) {
            
            // 1. Retrieve the user's non-expired trials for these challenges
            const trials = await new TrialsStore(db, execContext).getNonExpiredTrialsOnChallenges(challenges.map(c => c.id!));

            // 2. Map challenges to ExtendedChallenge with status
            const extendedChallenges: ExtendedChallenge[] = challenges.map(challenge => ({
                challenge: challenge, 
                status: trials.filter(t => t.challengeId === challenge.id).length === 0 ? "not-started" : trials.some(t => !t.completedOn) ? "in-progress" : "completed"
            }));

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
    status: "not-started" | "in-progress" | "completed";
}

export class GetChallengesOptions {
    includeStatus: boolean = false;

    static fromHTTPRequest(req: Request): GetChallengesOptions {

        const options = new GetChallengesOptions();

        if (req.query.includeStatus && req.query.includeStatus === "true") options.includeStatus = true;

        return options;
    }
}