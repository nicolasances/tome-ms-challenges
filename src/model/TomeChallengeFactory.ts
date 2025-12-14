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
}