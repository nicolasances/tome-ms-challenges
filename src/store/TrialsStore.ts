import { Db } from "mongodb";
import { ExecutionContext } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { Trial } from "../model/Trial";

export class TrialsStore {

    trials: string;

    constructor(private db: Db, private execContext: ExecutionContext) {
        this.trials = (execContext.config as ControllerConfig).getCollections().trials;
    }

    /**
     * Creates the trial in the database. 
     * 
     * @param trial 
     */
    async createTrial(trial: Trial): Promise<string> {

        const result = await this.db.collection(this.trials).insertOne(trial);

        return result.insertedId.toString();
    }

    /**
     * Finds the open trials on a given challenge.
     * 
     * @param challengeId the challenge id
     * @returns 
     */
    async getOpenTrialsOnChallenge(challengeId: string): Promise<Trial[]> {

        const docs = await this.db.collection(this.trials).find({ challengeId: challengeId, $or: [{ completedOn: null }, { completedOn: { $exists: false } }] }).toArray();

        return docs.map(doc => Trial.fromMongoDoc(doc));
    }

    /**
     * Retrieves all non-expired trials on the given challenges.
     * 
     * @param challengeIds 
     * @returns 
     */
    async getNonExpiredTrialsOnChallenges(challengeIds: string[]): Promise<Trial[]> {

        const now = new Date();

        const docs = await this.db.collection(this.trials).find({
            challengeId: { $in: challengeIds },
            expiresOn: { $gt: now },
            $or: [{ completedOn: null }, { completedOn: { $exists: false } }]
        }).toArray();

        return docs.map(doc => Trial.fromMongoDoc(doc));
    }
}