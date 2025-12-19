import { TotoRuntimeError, ValidationError } from "toto-api-controller";
import { TomeChallenge } from "./TomeChallenge";
import { JuiceChallenge } from "./challenges/JuiceChallenge";


export class ChallengeFactory {

    static fromMongoDoc(doc: any): TomeChallenge {

        switch (doc.code) {
            case 'juice':
                return JuiceChallenge.fromMongoDoc(doc);
            default:
                throw new TotoRuntimeError(500, `Unsupported challenge type: ${doc.type}`);
        }
    }

    static fromHTTPBody(body: any): TomeChallenge {

        if (!body.code) throw new ValidationError(400, 'The challenge code is required');

        switch (body.code) {
            case 'juice':
                return JuiceChallenge.fromHTTPBody(body);
            default:
                throw new TotoRuntimeError(500, `Unsupported challenge type: ${body.code}`);
        }
    }

    /**
     * Retrieves the number of days after which a challenge of the given code expires (expiry in terms of when the trial results expire).
     * 
     * @param challengeCode the code of the challenge
     */
    static getChallengeExpiration(challengeCode: string): number {

        if (!challengeCode) throw new ValidationError(400, 'The challenge type is required');

        switch (challengeCode) {
            case 'juice':
                return JuiceChallenge.EXPIRATION_DAYS;
            default:
                throw new TotoRuntimeError(500, `Unsupported challenge type: ${challengeCode}`);
        }
    }
}