import { Db, ObjectId } from "mongodb";
import { ExecutionContext } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { TestAnswer, Trial } from "../model/Trial";
import { Options } from "../dlg/trials/GetTrials";

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
     * Retrieves the trial with the given id.
     * 
     * @param trialId the Mongo ObjectId of the trial
     * @returns 
     */
    async getTrialById(trialId: string): Promise<Trial | null> {

        const doc = await this.db.collection(this.trials).findOne({ _id: new ObjectId(trialId) }) as Trial | null;

        return doc ? Trial.fromMongoDoc(doc) : null;
    }

    /**
     * Marks the trial as completed and updates the score.
     * 
     * @param trialId the trial 
     * @param completedOn the date the trial was completed on 
     * @param score the final score
     */
    async markTrialAsCompleted(trialId: string, completedOn: Date, score: number): Promise<void> {

        await this.db.collection(this.trials).updateOne(
            { _id: new ObjectId(trialId) },
            {
                $set: {
                    completedOn: completedOn,
                    score: score
                }
            }
        );
    }

    /**
     * Retrieves all trials
     * @returns 
     */
    async getTrials(): Promise<Trial[]> {

        const docs = await this.db.collection(this.trials).find({}).toArray();

        return docs.map(doc => Trial.fromMongoDoc(doc));
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
     * Updates the Trial with the given test answer.
     * 
     * IMPORTANT: this method ensures that if an answer for the given testId already exists, it is replaced.
     * 
     * @param trialId the Id of the trial
     * @param testAnswer the test answer
     */
    async saveTrialTestAnswer(trialId: string, testAnswer: TestAnswer): Promise<void> {

        // First, ensure the answers field is initialized as an array if it's null or doesn't exist
        await this.db.collection(this.trials).updateOne(
            { _id: new ObjectId(trialId), answers: null },
            {
                $set: { answers: [] }
            }
        );

        // Try to update an existing answer with matching testId
        const result = await this.db.collection(this.trials).updateOne(
            { _id: new ObjectId(trialId), "answers.testId": testAnswer.testId },
            {
                $set: { "answers.$": testAnswer }
            }
        );

        // If no existing answer was found, add the new answer
        if (result.matchedCount === 0) {
            await this.db.collection(this.trials).updateOne(
                { _id: new ObjectId(trialId) },
                {
                    $push: { answers: testAnswer }
                }
            );
        }

    }

    /**
     * Retrieves all non-expired trials on the given challenges that have not been completed.
     * 
     * @param challengeIds 
     * @returns 
     */
    async getOpenNonExpiredTrialsOnChallenges(challengeIds: string[]): Promise<Trial[]> {

        const now = new Date();

        const docs = await this.db.collection(this.trials).find({
            challengeId: { $in: challengeIds },
            expiresOn: { $gt: now },
            $or: [{ completedOn: null }, { completedOn: { $exists: false } }]
        }).toArray();

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
        }).toArray();

        return docs.map(doc => Trial.fromMongoDoc(doc));
    }

    /**
     * Retrieves all non-expired trials on the given challenges that have been completed.
     * 
     * @param challengeIds 
     * @returns 
     */
    async getCompletedNonExpiredTrialsOnChallenges(challengeIds: string[]): Promise<Trial[]> {

        const now = new Date();

        const docs = await this.db.collection(this.trials).find({
            challengeId: { $in: challengeIds },
            completedOn: { $ne: null },
            expiresOn: { $gt: now },
        }).toArray();

        return docs.map(doc => Trial.fromMongoDoc(doc));
    }

    /**
     * Marks the specified trials as "attempt"
     * 
     * @param trialIds 
     */
    async markTrialsAsAttempt(trialIds: string[]): Promise<void> {

        await this.db.collection(this.trials).updateMany(
            { _id: { $in: trialIds.map(id => new ObjectId(id)) } },
            {
                $set: { attempt: true }
            }
        );
    }
}