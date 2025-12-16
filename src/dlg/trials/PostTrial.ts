import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../../Config";

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

    }

}