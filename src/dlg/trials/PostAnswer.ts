import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext, ValidationError } from "totoms";
import { ControllerConfig } from "../../Config";
import { TomeTest } from "../../model/TomeTest";
import { TestScorerFactory } from "../../core/Scoring";
import { TrialsStore } from "../../store/TrialsStore";
import { ChallengesStore } from "../../store/ChallengesStore";
import { TrialScorerFactory } from "../../core/scorers/TrialScorer";
import { SettingsStore } from "../../store/SettingsStore";

/**
 * Post an Answer for a given test. 
 * The answer is evaluated, scored and the result is returned. 
 */
export class PostAnswer extends TotoDelegate<PostAnswerRequest, PostAnswerResponse> {

    async do(req: PostAnswerRequest, userContext?: UserContext): Promise<PostAnswerResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());

        const { trialId, challengeId, test, answer } = req;

        // 1. Validate input 
        if (!trialId) throw new ValidationError(400, "Missing mandatory field: trialId");
        if (!test) throw new ValidationError(400, "Missing mandatory field: test");
        if (!test.type) throw new ValidationError(400, "Missing mandatory field: test.type");
        if (answer === undefined || answer === null) throw new ValidationError(400, "Missing mandatory field: answer");

        // 2. Evaluate and score the answer
        const scorer = TestScorerFactory.getScorerForTest(test, config, this.cid);

        const score = await scorer.scoreAnswer(answer, test, trialId);

        // 3. Save the answer result in the database
        await new TrialsStore(db, config).saveTrialTestAnswer(trialId, {answer: answer, score: score.score, details: score.details, testId: test.testId} );

        // 4.2. Check how many answers have been submitted for this trial
        const trial = await new TrialsStore(db, config).getTrialById(trialId);

        if (!trial) throw new ValidationError(404, `Trial with id ${trialId} not found`);

        // 4. Check if the trial is now complete
        // 4.1. Check how many tests are in the challenge
        const challenge = await new ChallengesStore(db, config).getChallengeById(trial.challengeId);

        const totalTests = challenge?.tests.length || 0;

        const submittedAnswers = trial?.answers?.length || 0;

        // 4.3. If all tests have been answered, mark the trial as complete
        let trialScore: number | null = null;
        
        if (submittedAnswers >= totalTests) {

            // Get the Trial Scorer settings
            const settings = await new SettingsStore(db, config).loadSettings();

            // Calculate the final trial score
            const trialScorer = TrialScorerFactory.getScorer(settings.trialScorerConfiguration);

            trialScore = await trialScorer.scoreTrial(trial, challenge!);

            // Save the score
            await new TrialsStore(db, config).markTrialAsCompleted(trialId, new Date(), trialScore);
            
        }

        // 4. Return the result 
        return {
            score: score, 
            trialScore: trialScore, 
            completed: trialScore !== null
        }
    }

    parseRequest(req: Request): PostAnswerRequest {
        return {
            trialId: req.params.trialId,
            challengeId: req.body.challengeId,
            test: req.body.test as TomeTest,
            answer: req.body.answer
        };
    }

}

interface PostAnswerRequest extends TotoRequest {
    trialId: string;
    challengeId: string;
    test: TomeTest;
    answer: any;
}

interface PostAnswerResponse {
    score: any;
    trialScore: number | null;
    completed: boolean;
}