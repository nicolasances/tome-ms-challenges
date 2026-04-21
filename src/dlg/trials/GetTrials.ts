import { Request } from "express";
import { TotoDelegate, TotoRequest, UserContext } from "totoms";
import { ControllerConfig } from "../../Config";
import { TrialsStore } from "../../store/TrialsStore";
import { Trial } from "../../model/Trial";
import { ChallengesStore } from "../../store/ChallengesStore";

/**
 * Retrieves all trials
 */
export class GetTrials extends TotoDelegate<GetTrialsRequest, GetTrialsResponse> {

    async do(req: GetTrialsRequest, userContext?: UserContext): Promise<GetTrialsResponse> {

        const config = this.config as ControllerConfig;
        const db = await config.getMongoDb(config.getDBName());

        // Filtering by topic and challenge code: will get all the trials for that challenge on that topic
        if (req.topicId && req.challengeCode) {

            const challenges = await new ChallengesStore(db, config).getChallengesOfTopic(req.topicId);

            const filteredChallenges = challenges.filter(challenge => challenge.code === req.challengeCode);

            const trials = await new TrialsStore(db, config).getNonExpiredTrialsOnChallenges(filteredChallenges.map(c => c.id!.toString()));

            return { trials: trials, message: `Non-Expired Trials for challenge ${req.challengeCode} on topic ${req.topicId}` };
        }
        else if (req.topicId && !req.challengeCode) {

            const challenges = await new ChallengesStore(db, config).getChallengesOfTopic(req.topicId);

            const trials = await new TrialsStore(db, config).getNonExpiredTrialsOnChallenges(challenges.map(c => c.id!.toString()));

            return { trials: trials, message: `Non-Expired Trials on topic ${req.topicId}` };

        }

        // Unfiltered
        const trials = await new TrialsStore(db, config).getTrials().toArray();

        return { trials: trials };
    }

    parseRequest(req: Request): GetTrialsRequest {
        return {
            challengeCode: req.query.challengeCode ? String(req.query.challengeCode) : null,
            topicId: req.query.topicId ? String(req.query.topicId) : null
        };
    }

}

interface GetTrialsRequest extends TotoRequest {
    topicId: string | null;
    challengeCode: string | null;
}

interface GetTrialsResponse {
    trials: Trial[];
    message?: string;
}
