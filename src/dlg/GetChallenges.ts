import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { ChallengesStore } from "../store/ChallengesStore";
import { TomeChallenge } from "../model/TomeChallenge";

/**
 * Retrieves Challenges. 
 * 
 * Supports the following possibilities: 
 * 1. Get all Challenges for a give Topic. That will extract both Section and Topic Challenges.
 * 2. Get all General Challenges (not yet implemented).
 * 
 */
export class GetChallenges implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<GetTopicChallengesResponse> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const challenges = await new ChallengesStore(db, execContext).getChallengesOfTopic(req.params.topicId);

        return { challenges: challenges };
    }

}

export interface GetTopicChallengesResponse {
    challenges: TomeChallenge[];
}