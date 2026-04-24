import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext } from "totoms";
import { ControllerConfig } from "../Config";
import { ChallengesStore } from "../store/ChallengesStore";
import { ChallengeFactory } from "../model/TomeChallengeFactory";

/**
 * Creates a new Challenge for a given Tome Topic.
 * 
 * If there is already a Challenge of the same type for the given Topic, it is replaced.
 */
export class PostChallenge extends TotoDelegate<PostChallengeRequest, PostChallengeResponse> {

    async do(req: PostChallengeRequest, userContext?: UserContext): Promise<PostChallengeResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());

        await new ChallengesStore(db, config).saveChallenge(req.challenge);

        return { message: 'Challenge saved successfully' };
    }

    parseRequest(req: Request): PostChallengeRequest {
        return { challenge: ChallengeFactory.fromHTTPBody(req.body) };
    }

}

interface PostChallengeRequest extends TotoRequest {
    challenge: any;
}

interface PostChallengeResponse {
    message: string;
}