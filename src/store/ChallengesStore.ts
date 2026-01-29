import { Db, ObjectId } from "mongodb";
import { ExecutionContext, TotoRuntimeError } from "toto-api-controller";
import { SectionChallenge, TomeChallenge, TopicChallenge } from "../model/TomeChallenge";
import { ChallengeFactory } from "../model/TomeChallengeFactory";

export class ChallengesStore {

    challenges: any;

    constructor(private db: Db, private execContext: ExecutionContext) {
        this.challenges = this.db.collection('challenges');
    }

    /**
     * Retrieves the challenge with the given id.
     * 
     * @param challengeId the Mongo ObjectId of the challenge
     * @returns 
     */
    async getChallengeById(challengeId: string): Promise<TomeChallenge | null> {

        const doc = await this.challenges.findOne({ _id: new ObjectId(challengeId) }) as TomeChallenge | null;

        return doc ? ChallengeFactory.fromMongoDoc(doc) : null;
    }

    /**
     * Upserts the given challenge in the database.
     * 
     * @param challenge the challenge to upsert
     */
    async saveChallenge(challenge: TomeChallenge): Promise<void> {

        // Upsert the challenge based on its type and topicId
        if (challenge.type == 'topic') {
            await this.challenges.updateOne(
                { topicId: (challenge as TopicChallenge).topicId, code: challenge.code },
                { $set: challenge.toMongoDoc() },
                { upsert: true }
            );

        }
        else if (challenge.type == 'section') {
            await this.challenges.updateOne(
                { topicId: (challenge as SectionChallenge).topicId, sectionCode: (challenge as SectionChallenge).sectionCode, code: challenge.code },
                { $set: challenge.toMongoDoc() },
                { upsert: true }
            );
        }
        else throw new TotoRuntimeError(500, `Unsupported challenge type: ${challenge.type}`);

    }

    /**
     * Just get me all the freakin' challenges.
     * 
     * @returns all the challenges
     */
    async getChallenges(options?: { topicId?: string }): Promise<TomeChallenge[]> {

        const filter: any = {};
        if (options?.topicId) filter.topicId = options.topicId;

        const docs = await this.challenges.find(filter).toArray() as any[];

        return docs.map(doc => ChallengeFactory.fromMongoDoc(doc));
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
