import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { Trial } from "../../model/Trial";

/**
 * Retrieves the trial by Id 
 */
export class GetTrial implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const trial = await new TrialsStore(db, execContext).getTrialById(req.params.trialId);

        return { trial: trial! };

    }

}

interface GetTrialResponse {
    trial: Trial;
}