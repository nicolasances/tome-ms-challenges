import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { TrialFactory } from "../../model/TrialFactory";

/**
 * Creates a new trial for a given Tome Topic and Challenge. 
 * 
 * If there is already a Challenge of the same type for the given Topic, nothing will happen.
 */
export class PostTrial implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        // 2. Check if an OPEN trial on the same challenge already exists. In that case, return the trial id
        const existingTrials = await new TrialsStore(db, execContext).getOpenTrialsOnChallenge(req.body.challengeId);

        if (existingTrials.length > 0) return { id: existingTrials[0].id };

        // 3. Create and save the trial
        const trial = await new TrialFactory(db, execContext).newTrial(req.body.challengeId);

        // 3. Save the trial
        const trialId = await new TrialsStore(db, execContext).createTrial(trial);

        return { id: trialId };
    }

}