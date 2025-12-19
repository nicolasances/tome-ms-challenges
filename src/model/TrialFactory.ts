import { Db } from "mongodb";
import { Trial } from "./Trial";
import { ExecutionContext, ValidationError } from "toto-api-controller";
import { ChallengesStore } from "../store/ChallengesStore";
import { ChallengeFactory } from "./TomeChallengeFactory";

export class TrialFactory {

    challengesStore: ChallengesStore;

    constructor(private db: Db, private execContext: ExecutionContext) {

        this.challengesStore = new ChallengesStore(db, execContext);
    }

    /**
     * Creates a new Trial for the given challenge Id.
     * 
     * Does the following: 
     * 1. Fetches the challenge from the ChallengesStore 
     * 2. Based on the type of challenge, creates the Trial with the appropriate parameters (e.g., expiration date).
     * 3. Returns the Trial object.
     * 
     * @param challengeId the challenge Id
     */
    async newTrial(challengeId: string): Promise<Trial> {

        const challenge = await this.challengesStore.getChallengeById(challengeId);

        if (!challenge) throw new ValidationError(400, `Challenge with id ${challengeId} not found`);

        const expirationDays = ChallengeFactory.getChallengeExpiration(challenge.type);

        const now = new Date();
        const expiresOn = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

        const trial = new Trial({
            challengeId: challengeId,
            startedOn: now,
            expiresOn: expiresOn,
        });

        return trial;

    }
}