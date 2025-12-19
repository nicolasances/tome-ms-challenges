import { TotoRuntimeError, ValidationError } from "toto-api-controller";
import { TomeChallenge } from "./TomeChallenge";
import { JuiceChallenge } from "./challenges/JuiceChallenge";


export class ChallengeFactory {

    static fromMongoDoc(doc: any): TomeChallenge {

        switch (doc.type) {
            case 'juice':
                return JuiceChallenge.fromMongoDoc(doc);
            default:
                throw new TotoRuntimeError(500, `Unsupported challenge type: ${doc.type}`);
        }
    }

    static fromHTTPBody(body: any): TomeChallenge {

        if (!body.type) throw new ValidationError(400, 'The challenge type is required');

        switch (body.type) {
            case 'juice':
                return JuiceChallenge.fromHTTPBody(body);
            default:
                throw new TotoRuntimeError(500, `Unsupported challenge type: ${body.type}`);
        }
    }

    /**
     * Retrieves the number of days after which a challenge of the given type expires (expiry in terms of when the trial results expire).
     * 
     * @param challengeType the type of challenge
     */
    static getChallengeExpiration(challengeType: string): number {

        if (!challengeType) throw new ValidationError(400, 'The challenge type is required');

        switch (challengeType) {
            case 'juice':
                return JuiceChallenge.EXPIRATION_DAYS;
            default:
                throw new TotoRuntimeError(500, `Unsupported challenge type: ${challengeType}`);
        }
    }
}