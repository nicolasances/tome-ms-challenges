import { ExecutionContext } from "toto-api-controller";
import { GaleBrokerAPI } from "../../api/GaleBrokerAPI";
import { OpenTest } from "../../model/tests/OpenTest";
import { TestScorer } from "../Scoring";
import { ChallengesStore } from "../../store/ChallengesStore";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { JuiceChallenge } from "../../model/challenges/JuiceChallenge";

/**
 * Scores open question tests.
 * 
 * This requires the usage of an LLM to evaluate the answer.
 */
export class JuiceQuestionScorer implements TestScorer<OpenTest> {

    constructor(private execContext: ExecutionContext) { }

    async scoreAnswer(answer: any, test: OpenTest, trialId: string): Promise<number> {

        const logger = this.execContext.logger;
        const cid = this.execContext.cid;
        const config = this.execContext.config as ControllerConfig;
        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        // 1. Get the challenge
        const trial = await new TrialsStore(db, this.execContext).getTrialById(trialId);
        const challenge = await new ChallengesStore(db, this.execContext).getChallengeById(trial!.challengeId) as JuiceChallenge;

        // Integrate with LLM to evaluate the answer against the expected answer.
        logger.compute(cid, `Scoring Juice open question test ${test.testId} for trial ${trialId} using Gale Agent 'juice.answer.eval'...`);

        const response = await new GaleBrokerAPI("gale-broker", this.execContext.config).postTask("juice.answer.eval", {
            userAnswer: answer,
            juice: challenge.toRemember
        });

        logger.compute(cid, `Received response from Gale Agent for scoring question: ${JSON.stringify(response)}`);

        const gotRight = (response.taskOutput as TaskOutput).numAspectsFound;
        const numAspects = challenge.toRemember.length;

        let score = gotRight / numAspects;

        logger.compute(cid, `Score for test ${test.testId} in trial ${trialId} is ${score} (${gotRight} aspects found out of ${numAspects})`);

        return score;
    }
}

interface TaskOutput {
    numAspectsFound: number;
    juiceIndexesFound: number[];
    explanation: string;
}