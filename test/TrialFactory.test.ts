import { expect } from "chai";
import { TrialFactory } from "../src/model/TrialFactory";
import { JuiceChallenge } from "../src/model/challenges/JuiceChallenge";

describe("TrialFactory", () => {

    // Create a mock db that returns a mock collection
    const createMockDb = () => ({
        collection: () => ({})
    } as any);

    const createMockConfig = () => ({
        getCollections: () => ({ challenges: "challenges" })
    } as any);

    describe("newTrial", () => {

        it("should create a trial with correct expiration for juice challenge", async () => {
            // Create a mock challenge
            const mockChallenge = new JuiceChallenge({
                id: "challenge-123",
                topicId: "topic-1",
                topicCode: "history",
                sectionIndex: 0,
                sectionCode: "roman-empire",
                context: "Context...",
                toRemember: [],
                tests: []
            });

            // Create factory with mocked db
            const factory = new TrialFactory(createMockDb(), createMockConfig());

            // Override the challengesStore to return our mock challenge
            factory.challengesStore = {
                getChallengeById: async (id: string) => mockChallenge
            } as any;

            // Record time before creating trial
            const beforeCreation = new Date();

            // Create trial
            const trial = await factory.newTrial("challenge-123");

            const afterCreation = new Date();

            // Verify trial properties
            expect(trial.challengeId).to.equal("challenge-123");
            expect(trial.startedOn.getTime()).to.be.at.least(beforeCreation.getTime());
            expect(trial.startedOn.getTime()).to.be.at.most(afterCreation.getTime());

            // Verify expiration is 60 days from now (JuiceChallenge.EXPIRATION_DAYS = 60)
            const expectedExpirationMs = trial.startedOn.getTime() + (60 * 24 * 60 * 60 * 1000);
            expect(trial.expiresOn.getTime()).to.equal(expectedExpirationMs);

            // Trial should not have id, completedOn, score, or answers yet
            expect(trial.id).to.be.undefined;
            expect(trial.completedOn).to.be.undefined;
            expect(trial.score).to.be.undefined;
            expect(trial.answers).to.be.undefined;
            expect(trial.attempt).to.equal(false);
        });

        it("should throw ValidationError when challenge is not found", async () => {
            const factory = new TrialFactory(createMockDb(), createMockConfig());

            // Override to return null (challenge not found)
            factory.challengesStore = {
                getChallengeById: async (id: string) => null
            } as any;

            try {
                await factory.newTrial("non-existent-challenge");
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.include("Challenge with id non-existent-challenge not found");
            }
        });

    });

    describe("expiration calculation", () => {

        it("should calculate expiration correctly across month boundaries", async () => {
            const mockChallenge = new JuiceChallenge({
                id: "challenge-123",
                topicId: "topic-1",
                topicCode: "history",
                sectionIndex: 0,
                sectionCode: "section",
                context: "Context",
                toRemember: [],
                tests: []
            });

            const factory = new TrialFactory(createMockDb(), createMockConfig());
            factory.challengesStore = {
                getChallengeById: async () => mockChallenge
            } as any;

            const trial = await factory.newTrial("challenge-123");

            // Verify the difference is exactly 60 days in milliseconds
            const diffMs = trial.expiresOn.getTime() - trial.startedOn.getTime();
            const diffDays = diffMs / (24 * 60 * 60 * 1000);

            expect(diffDays).to.equal(60);
        });

    });

});
