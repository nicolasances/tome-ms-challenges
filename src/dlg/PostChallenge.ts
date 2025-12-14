import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { ChallengesStore } from "../store/ChallengesStore";
import { JuiceChallenge } from "../model/challenges/JuiceChallenge";

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

        const challengeType = req.body.type;

        if (!challengeType) throw new ValidationError(400, 'The challenge type is required');

        // Create the appropriate Challenge instance based on the type
        let challenge: JuiceChallenge;

        if (challengeType == 'juice') challenge = JuiceChallenge.fromHTTPBody(req.body);
        else throw new ValidationError(400, `Unsupported challenge type: ${challengeType}`);

        await new ChallengesStore(db, execContext).saveChallenge(challenge);

        return { message: 'Challenge saved successfully' };
    }

}