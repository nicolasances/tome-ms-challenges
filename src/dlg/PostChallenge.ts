import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { ChallengesStore } from "../store/ChallengesStore";
import { ChallengeFactory } from "../model/TomeChallengeFactory";

/**
 * Creates a new Challenge for a given Tome Topic.
 * 
 * If there is already a Challenge of the same type for the given Topic, it is replaced.
 */
export class PostChallenge implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const challenge = ChallengeFactory.fromHTTPBody(req.body);

        await new ChallengesStore(db, execContext).saveChallenge(challenge);

        return { message: 'Challenge saved successfully' };
    }

}