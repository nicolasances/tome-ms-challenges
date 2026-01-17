import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { TrialFactory } from "../../model/TrialFactory";

/**
 * Creates a new trial for a given Tome Topic and Challenge. 
 */
export class DeleteTrial implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());
        const trialsStore = new TrialsStore(db, execContext);

        const trialId = req.params.trialId;

        await trialsStore.deleteTrial(trialId);

        return { id: trialId };
    }

}