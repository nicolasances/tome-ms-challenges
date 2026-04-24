import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext } from "totoms";
import { ControllerConfig } from "../Config";
import { ChallengesStore } from "../store/ChallengesStore";
import { TomeChallenge } from "../model/TomeChallenge";

/**
 * Retrieves a specific Challenge, identified by its id.
 * 
 */
export class GetChallenge extends TotoDelegate<GetChallengeRequest, GetChallengeResponse> {

    async do(req: GetChallengeRequest, userContext?: UserContext): Promise<GetChallengeResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());

        const challenge = await new ChallengesStore(db, config).getChallengeById(req.challengeId);

        return { challenge: challenge! };

    }

    parseRequest(req: Request): GetChallengeRequest {
        return { challengeId: req.params.challengeId };
    }

}

interface GetChallengeRequest extends TotoRequest {
    challengeId: string;
}

export interface GetChallengeResponse {
    challenge: TomeChallenge;
}