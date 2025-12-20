import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { ChallengesStore } from "../store/ChallengesStore";
import { TomeChallenge } from "../model/TomeChallenge";

/**
 * Retrieves a specific Challenge, identified by its id.
 * 
 */
export class GetChallenge implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<GetChallengeResponse> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const challenge = await new ChallengesStore(db, execContext).getChallengeById(req.params.challengeId);

        return { challenge: challenge! };

    }

}

export interface GetChallengeResponse {
    challenge: TomeChallenge;
}