import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TomeTest } from "../../model/TomeTest";
import { TestScorerFactory } from "../../core/Scoring";
import { TrialsStore } from "../../store/TrialsStore";
import { ChallengesStore } from "../../store/ChallengesStore";

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
        const challengeId = req.body.challengeId; 
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
        await new TrialsStore(db, execContext).saveTrialTestAnswer(trialId, {answer: answer, score: score, testId: test.testId} );

        // 4.2. Check how many answers have been submitted for this trial
        const trial = await new TrialsStore(db, execContext).getTrialById(trialId);

        if (!trial) throw new ValidationError(404, `Trial with id ${trialId} not found`);   

        // 4. Check if the trial is now complete
        // 4.1. Check how many tests are in the challenge
        const challenge = await new ChallengesStore(db, execContext).getChallengeById(trial.challengeId);

        const totalTests = challenge?.tests.length || 0;

        const submittedAnswers = trial?.answers?.length || 0;

        // 4.3. If all tests have been answered, mark the trial as complete
        let trialScore = null;
        if (submittedAnswers >= totalTests) {

            // Sum scores
            const summedScores = trial?.answers?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;

            trialScore = totalTests > 0 ? summedScores / totalTests : 0;

            // Save the score
            await new TrialsStore(db, execContext).markTrialAsCompleted(trialId, new Date(), trialScore);
            
        }

        // 4. Return the result 
        return {
            score: score, 
            trialScore: trialScore, 
            completed: trialScore !== null
        }
    }

}