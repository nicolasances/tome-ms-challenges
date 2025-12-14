import { Db } from "mongodb";
import { ExecutionContext, TotoRuntimeError } from "toto-api-controller";
import { TomeChallenge } from "../model/TomeChallenge";

export class ChallengesStore {

    constructor(private db: Db, private execContext: ExecutionContext) { }

    /**
     * Returns the MongoDB collection for the given challenge type.
     * 
     * @param challengeType The type of challenge
     * @returns 
     */
    private getCollection(challengeType: string) {

        switch (challengeType) {
            case 'juice':
                return this.db.collection('juice');
            default:
                throw new TotoRuntimeError(500, `Unknown challenge type: ${challengeType}`);
        }
    }

    /**
     * Upserts the given challenge in the database.
     * 
     * @param challenge the challenge to upsert
     */
    async saveChallenge(challenge: TomeChallenge): Promise<void> {

        // Upsert the challenge based on its type and topicId
        const collection = this.getCollection(challenge.type);

        await collection.updateOne(
            { topicId: challenge.topicId, type: challenge.type },
            { $set: challenge.toMongoDoc() },
            { upsert: true }
        );

    }
}