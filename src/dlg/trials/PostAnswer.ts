import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TomeTest } from "../../model/TomeTest";
import { TestScorerFactory } from "../../core/Scoring";

/**
 * Post an Answer for a given test. 
 * The answer is evaluated, scored and the result is returned. 
 */
export class PostAnswer implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const trialId = req.params.trialId;
        const test = req.body.test as TomeTest;
        const answer = req.body.answer;

        // 1. Validate input 
        if (!trialId) throw new ValidationError(400, "Missing mandatory field: trialId");
        if (!test) throw new ValidationError(400, "Missing mandatory field: test");
        if (!test.type) throw new ValidationError(400, "Missing mandatory field: test.type");
        if (answer === undefined || answer === null) throw new ValidationError(400, "Missing mandatory field: answer");

        // 2. Evaluate and score the answer
        const scorer = TestScorerFactory.getScorerForTest(test, execContext);

        const score = await scorer.scoreAnswer(answer, test, trialId);

        // 3. Save the answer result in the database
        // TODO

        // 4. Return the result 
        return {
            score: score
        }
    }

}