import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext } from "totoms";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { Trial } from "../../model/Trial";

/**
 * Retrieves the trial by Id 
 */
export class GetTrial extends TotoDelegate<GetTrialRequest, GetTrialResponse> {

    async do(req: GetTrialRequest, userContext?: UserContext): Promise<GetTrialResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());

        const trial = await new TrialsStore(db, config).getTrialById(req.trialId);

        return { trial: trial! };

    }

    parseRequest(req: Request): GetTrialRequest {
        return { trialId: req.params.trialId };
    }

}

interface GetTrialRequest extends TotoRequest {
    trialId: string;
}

interface GetTrialResponse {
    trial: Trial;
}