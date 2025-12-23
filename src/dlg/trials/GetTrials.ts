import { Request } from "express";
import { ExecutionContext, TotoDelegate, UserContext } from "toto-api-controller";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { Trial } from "../../model/Trial";
import { ChallengesStore } from "../../store/ChallengesStore";

/**
 * Retrieves all trials
 */
export class GetTrials implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const config = execContext.config as ControllerConfig;

        const client = await config.getMongoClient();
        const db = client.db(config.getDBName());

        const options = Options.fromHTTPRequest(req);

        // Filtering by topic and challenge code: will get all the trials for that challenge on that topic
        if (options.topicId && options.challengeCode) {

            const challenges = await new ChallengesStore(db, execContext).getChallengesOfTopic(options.topicId);

            const filteredChallenges = challenges.filter(challenge => challenge.code === options.challengeCode);

            const trials = await new TrialsStore(db, execContext).getNonExpiredTrialsOnChallenges(filteredChallenges.map(c => c.id!.toString()));

            return { trials: trials, message: `Non-Expired Trials for challenge ${options.challengeCode} on topic ${options.topicId}` };
        }
        else if (options.topicId && !options.challengeCode) {

            const challenges = await new ChallengesStore(db, execContext).getChallengesOfTopic(options.topicId);

            const trials = await new TrialsStore(db, execContext).getNonExpiredTrialsOnChallenges(challenges.map(c => c.id!.toString()));

            return { trials: trials, message: `Non-Expired Trials on topic ${options.topicId}` };

        }

        // Unfiltered
        const trials = await new TrialsStore(db, execContext).getTrials();

        return { trials: trials };
    }

}

export class Options {

    topicId: string | null = null;
    challengeCode: string | null = null;

    static fromHTTPRequest(req: Request): Options {
        const options = new Options();
        if (req.query.challengeCode) options.challengeCode = String(req.query.challengeCode);
        if (req.query.topicId) options.topicId = String(req.query.topicId);
        return options;
    }

}
