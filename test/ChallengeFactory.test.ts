import { expect } from "chai";
import { ChallengeFactory } from "../src/model/TomeChallengeFactory";
import { JuiceChallenge } from "../src/model/challenges/JuiceChallenge";

describe("ChallengeFactory", () => {

    describe("fromMongoDoc", () => {

        it("should create JuiceChallenge from mongo doc with code 'juice'", () => {
            const mongoDoc = {
                _id: { toString: () => "challenge-123" },
                code: "juice",
                topicId: "topic-1",
                topicCode: "history",
                sectionIndex: 0,
                sectionCode: "roman-empire",
                context: "The Roman Empire...",
                toRemember: [{ toRemember: "Key fact 1" }],
                tests: [{ testId: "test-1", type: "open", question: "What is...?" }]
            };

            const challenge = ChallengeFactory.fromMongoDoc(mongoDoc);

            expect(challenge).to.be.instanceOf(JuiceChallenge);
            expect(challenge.code).to.equal("juice");
            expect((challenge as JuiceChallenge).topicId).to.equal("topic-1");
        });

        it("should throw error for unsupported challenge code", () => {
            const mongoDoc = {
                _id: { toString: () => "challenge-123" },
                code: "unknown-code",
                type: "general"
            };

            expect(() => ChallengeFactory.fromMongoDoc(mongoDoc)).to.throw();
        });

    });

    describe("fromHTTPBody", () => {

        it("should create JuiceChallenge from HTTP body with code 'juice'", () => {
            const body = {
                code: "juice",
                topicId: "topic-1",
                topicCode: "history",
                sectionIndex: 0,
                sectionCode: "roman-empire",
                context: "The Roman Empire...",
                toRemember: [{ toRemember: "Key fact 1" }],
                tests: [{ testId: "test-1", type: "open", question: "What is...?" }]
            };

            const challenge = ChallengeFactory.fromHTTPBody(body);

            expect(challenge).to.be.instanceOf(JuiceChallenge);
            expect(challenge.code).to.equal("juice");
        });

        it("should throw ValidationError when code is missing", () => {
            const body = {
                topicId: "topic-1"
            };

            expect(() => ChallengeFactory.fromHTTPBody(body)).to.throw("The challenge code is required");
        });

        it("should throw error for unsupported challenge code", () => {
            const body = {
                code: "unknown-code"
            };

            expect(() => ChallengeFactory.fromHTTPBody(body)).to.throw();
        });

    });

    describe("getChallengeExpiration", () => {

        it("should return 60 days for juice challenge", () => {
            const expiration = ChallengeFactory.getChallengeExpiration("juice");

            expect(expiration).to.equal(60);
        });

        it("should throw ValidationError when challengeCode is missing", () => {
            expect(() => ChallengeFactory.getChallengeExpiration("")).to.throw("The challenge type is required");
        });

        it("should throw error for unsupported challenge code", () => {
            expect(() => ChallengeFactory.getChallengeExpiration("unknown")).to.throw();
        });

    });

});
