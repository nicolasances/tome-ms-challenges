import { Db } from "mongodb";
import { ExecutionContext, TotoRuntimeError } from "toto-api-controller";
import { TomeChallenge } from "../model/TomeChallenge";
import { ChallengeFactory } from "../model/TomeChallengeFactory";

export class ChallengesStore {

    challenges: any;

    constructor(private db: Db, private execContext: ExecutionContext) {
        this.challenges = this.db.collection('challenges');
    }

    /**
     * Upserts the given challenge in the database.
     * 
     * @param challenge the challenge to upsert
     */
    async saveChallenge(challenge: TomeChallenge): Promise<void> {

        // Upsert the challenge based on its type and topicId
        await this.challenges.updateOne(
            { topicId: challenge.topicId, type: challenge.type },
            { $set: challenge.toMongoDoc() },
            { upsert: true }
        );

    }

    /**
     * Retrieves all challenges for the given topic.
     * 
     * @param topicId the topic
     * @returns 
     */
    async getChallengesOfTopic(topicId: string): Promise<TomeChallenge[]> {

        const docs = await this.challenges.find({ topicId: topicId }).toArray() as any[];

        return docs.map(doc => ChallengeFactory.fromMongoDoc(doc));
    }
}
