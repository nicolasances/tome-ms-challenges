import { expect } from "chai";
import { JuiceChallenge } from "../src/model/challenges/JuiceChallenge";

describe("JuiceChallenge", () => {

    describe("fromHTTPBody validation", () => {

        const validBody = {
            topicId: "topic-1",
            topicCode: "history",
            sectionIndex: 0,
            sectionCode: "roman-empire",
            context: "The Roman Empire was...",
            toRemember: [{ toRemember: "Key fact 1" }],
            tests: [{ testId: "test-1", type: "open", question: "What is...?" }]
        };

        it("should create JuiceChallenge from valid body", () => {
            const challenge = JuiceChallenge.fromHTTPBody(validBody);

            expect(challenge).to.be.instanceOf(JuiceChallenge);
            expect(challenge.topicId).to.equal("topic-1");
            expect(challenge.topicCode).to.equal("history");
            expect(challenge.sectionIndex).to.equal(0);
            expect(challenge.sectionCode).to.equal("roman-empire");
            expect(challenge.context).to.equal("The Roman Empire was...");
            expect(challenge.toRemember).to.have.lengthOf(1);
            expect(challenge.tests).to.have.lengthOf(1);
        });

        it("should throw ValidationError when topicId is missing", () => {
            const body = { ...validBody, topicId: undefined };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The topicId is required");
        });

        it("should throw ValidationError when topicCode is missing", () => {
            const body = { ...validBody, topicCode: undefined };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The topicCode is required");
        });

        it("should throw ValidationError when sectionIndex is missing", () => {
            const body = { ...validBody, sectionIndex: undefined };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The sectionIndex is required");
        });

        it("should accept sectionIndex of 0", () => {
            const body = { ...validBody, sectionIndex: 0 };

            const challenge = JuiceChallenge.fromHTTPBody(body);

            expect(challenge.sectionIndex).to.equal(0);
        });

        it("should throw ValidationError when sectionCode is missing", () => {
            const body = { ...validBody, sectionCode: undefined };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The sectionCode is required");
        });

        it("should throw ValidationError when context is missing", () => {
            const body = { ...validBody, context: undefined };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The context is required");
        });

        it("should throw ValidationError when toRemember is missing", () => {
            const body = { ...validBody, toRemember: undefined };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The toRemember array is required");
        });

        it("should throw ValidationError when toRemember is not an array", () => {
            const body = { ...validBody, toRemember: "not an array" };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The toRemember array is required");
        });

        it("should throw ValidationError when tests is missing", () => {
            const body = { ...validBody, tests: undefined };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The tests array is required");
        });

        it("should throw ValidationError when tests is not an array", () => {
            const body = { ...validBody, tests: "not an array" };

            expect(() => JuiceChallenge.fromHTTPBody(body)).to.throw("The tests array is required");
        });

    });

    describe("fromMongoDoc", () => {

        it("should create JuiceChallenge from mongo document", () => {
            const doc = {
                _id: { toString: () => "challenge-123" },
                topicId: "topic-1",
                topicCode: "history",
                sectionIndex: 2,
                sectionCode: "roman-empire",
                context: "The Roman Empire was...",
                toRemember: [{ toRemember: "Key fact 1" }],
                tests: [{ testId: "test-1", type: "open", question: "What is...?" }]
            };

            const challenge = JuiceChallenge.fromMongoDoc(doc);

            expect(challenge.id).to.equal("challenge-123");
            expect(challenge.topicId).to.equal("topic-1");
            expect(challenge.sectionIndex).to.equal(2);
        });

        it("should handle missing _id", () => {
            const doc = {
                topicId: "topic-1",
                topicCode: "history",
                sectionIndex: 0,
                sectionCode: "roman-empire",
                context: "Context",
                toRemember: [],
                tests: []
            };

            const challenge = JuiceChallenge.fromMongoDoc(doc);

            expect(challenge.id).to.be.undefined;
        });

    });

    describe("toMongoDoc", () => {

        it("should convert challenge to mongo document format", () => {
            const challenge = new JuiceChallenge({
                id: "challenge-123",
                topicId: "topic-1",
                topicCode: "history",
                sectionIndex: 1,
                sectionCode: "roman-empire",
                context: "The Roman Empire was...",
                toRemember: [{ toRemember: "Key fact 1" }],
                tests: [{ testId: "test-1", type: "open", question: "What?" } as any]
            });

            const doc = challenge.toMongoDoc();

            expect(doc.type).to.equal("section");
            expect(doc.topicId).to.equal("topic-1");
            expect(doc.topicCode).to.equal("history");
            expect(doc.sectionIndex).to.equal(1);
            expect(doc.sectionCode).to.equal("roman-empire");
            expect(doc.context).to.equal("The Roman Empire was...");
            expect(doc.toRemember).to.have.lengthOf(1);
            expect(doc.tests).to.have.lengthOf(1);
            // Note: id is NOT included in mongo doc (it's the _id)
            expect((doc as any).id).to.be.undefined;
        });

    });

    describe("static properties", () => {

        it("should have EXPIRATION_DAYS set to 60", () => {
            expect(JuiceChallenge.EXPIRATION_DAYS).to.equal(60);
        });

    });

});
