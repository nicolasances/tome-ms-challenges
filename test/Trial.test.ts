import { expect } from "chai";
import { describe, it } from "mocha";
import { Trial } from "../src/model/Trial";

describe("Trial", () => {

    describe("constructor", () => {

        it("should create a Trial with required fields", () => {
            const now = new Date();
            const expires = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: now,
                expiresOn: expires
            });

            expect(trial.challengeId).to.equal("challenge-1");
            expect(trial.startedOn).to.equal(now);
            expect(trial.expiresOn).to.equal(expires);
            expect(trial.attempt).to.equal(false);
            expect(trial.id).to.be.undefined;
            expect(trial.completedOn).to.be.undefined;
            expect(trial.score).to.be.undefined;
            expect(trial.answers).to.be.undefined;
        });

        it("should create a Trial with all fields", () => {
            const startedOn = new Date("2024-01-01");
            const completedOn = new Date("2024-01-02");
            const expiresOn = new Date("2024-03-01");

            const trial = new Trial({
                id: "trial-123",
                challengeId: "challenge-1",
                startedOn,
                completedOn,
                expiresOn,
                score: 85,
                attempt: true,
                answers: [{ testId: "test-1", answer: "my answer", score: 85 }]
            });

            expect(trial.id).to.equal("trial-123");
            expect(trial.challengeId).to.equal("challenge-1");
            expect(trial.startedOn).to.equal(startedOn);
            expect(trial.completedOn).to.equal(completedOn);
            expect(trial.expiresOn).to.equal(expiresOn);
            expect(trial.score).to.equal(85);
            expect(trial.attempt).to.equal(true);
            expect(trial.answers).to.have.lengthOf(1);
        });

    });

    describe("fromHTTPRequest", () => {

        it("should parse HTTP request data correctly", () => {
            const data = {
                id: "trial-123",
                challengeId: "challenge-1",
                startedOn: "2024-01-01T10:00:00.000Z",
                expiresOn: "2024-03-01T10:00:00.000Z",
                completedOn: "2024-01-02T10:00:00.000Z",
                score: 75,
                attempt: true,
                answers: [{ testId: "test-1", answer: "answer", score: 75 }]
            };

            const trial = Trial.fromHTTPRequest(data);

            expect(trial.id).to.equal("trial-123");
            expect(trial.challengeId).to.equal("challenge-1");
            expect(trial.startedOn).to.be.instanceOf(Date);
            expect(trial.expiresOn).to.be.instanceOf(Date);
            expect(trial.completedOn).to.be.instanceOf(Date);
            expect(trial.score).to.equal(75);
            expect(trial.attempt).to.equal(true);
        });

        it("should handle missing optional fields", () => {
            const data = {
                challengeId: "challenge-1",
                startedOn: "2024-01-01T10:00:00.000Z",
                expiresOn: "2024-03-01T10:00:00.000Z"
            };

            const trial = Trial.fromHTTPRequest(data);

            expect(trial.completedOn).to.be.undefined;
            expect(trial.score).to.be.undefined;
            // Note: attempt defaults to false when not provided (not undefined)
            expect(trial.attempt).to.equal(false);
        });

        it("should preserve score of 0", () => {
            const data = {
                challengeId: "challenge-1",
                startedOn: "2024-01-01T10:00:00.000Z",
                expiresOn: "2024-03-01T10:00:00.000Z",
                score: 0
            };

            const trial = Trial.fromHTTPRequest(data);

            expect(trial.score).to.equal(0);
        });

    });

    describe("fromMongoDoc", () => {

        it("should parse MongoDB document correctly", () => {
            const doc = {
                _id: { toString: () => "trial-mongo-id" },
                challengeId: "challenge-1",
                startedOn: new Date("2024-01-01"),
                expiresOn: new Date("2024-03-01"),
                completedOn: new Date("2024-01-02"),
                score: 90,
                attempt: false,
                answers: [{ testId: "test-1", answer: "answer", score: 90 }]
            };

            const trial = Trial.fromMongoDoc(doc);

            expect(trial.id).to.equal("trial-mongo-id");
            expect(trial.challengeId).to.equal("challenge-1");
            expect(trial.startedOn).to.be.instanceOf(Date);
            expect(trial.completedOn).to.be.instanceOf(Date);
            expect(trial.score).to.equal(90);
            expect(trial.attempt).to.equal(false);
        });

        it("should handle missing optional fields in mongo doc", () => {
            const doc = {
                _id: { toString: () => "trial-mongo-id" },
                challengeId: "challenge-1",
                startedOn: new Date("2024-01-01"),
                expiresOn: new Date("2024-03-01")
            };

            const trial = Trial.fromMongoDoc(doc);

            expect(trial.completedOn).to.be.undefined;
            expect(trial.score).to.be.undefined;
            expect(trial.attempt).to.equal(false);
        });

        it("should preserve score of 0 from mongo doc", () => {
            const doc = {
                _id: { toString: () => "trial-mongo-id" },
                challengeId: "challenge-1",
                startedOn: new Date("2024-01-01"),
                expiresOn: new Date("2024-03-01"),
                score: 0
            };

            const trial = Trial.fromMongoDoc(doc);

            expect(trial.score).to.equal(0);
        });

    });

    describe("toMongoDoc", () => {

        it("should convert trial to MongoDB document format", () => {
            const startedOn = new Date("2024-01-01");
            const completedOn = new Date("2024-01-02");
            const expiresOn = new Date("2024-03-01");

            const trial = new Trial({
                id: "trial-123",
                challengeId: "challenge-1",
                startedOn,
                completedOn,
                expiresOn,
                score: 85,
                attempt: true,
                answers: [{ testId: "test-1", answer: "answer", score: 85 }]
            });

            const doc = trial.toMongoDoc();

            expect(doc.challengeId).to.equal("challenge-1");
            expect(doc.startedOn).to.equal(startedOn);
            expect(doc.completedOn).to.equal(completedOn);
            expect(doc.expiresOn).to.equal(expiresOn);
            expect(doc.score).to.equal(85);
            expect(doc.attempt).to.equal(true);
            expect(doc.answers).to.have.lengthOf(1);
            // id should NOT be in the mongo doc
            expect(doc.id).to.be.undefined;
        });

        it("should include undefined fields in mongo doc", () => {
            const trial = new Trial({
                challengeId: "challenge-1",
                startedOn: new Date(),
                expiresOn: new Date()
            });

            const doc = trial.toMongoDoc();

            expect(doc.completedOn).to.be.undefined;
            expect(doc.score).to.be.undefined;
            expect(doc.answers).to.be.undefined;
        });

    });

});
