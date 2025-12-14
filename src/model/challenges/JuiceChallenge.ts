import { ValidationError } from "toto-api-controller";
import { TomeChallenge } from "../TomeChallenge";

export class JuiceChallenge extends TomeChallenge {

    public type: string = "juice";
    public context: string;
    public topicId: string;
    public topicCode: string;

    public toRemember: ToRemember[];

    constructor({ topicId, topicCode, context, toRemember }: { topicId: string, topicCode: string, context: string, toRemember: ToRemember[] }) {
        super();
        this.topicId = topicId;
        this.topicCode = topicCode;
        this.context = context;
        this.toRemember = toRemember;
    }

    static fromMongoDoc(doc: any): JuiceChallenge {
        return new JuiceChallenge({
            topicId: doc.topicId,
            topicCode: doc.topicCode,
            context: doc.context,
            toRemember: doc.toRemember
        });
    }

    static fromHTTPBody(body: any): JuiceChallenge {

        // Check mandatory fields
        if (!body.topicId) throw new ValidationError(400, 'The topicId is required');
        if (!body.topicCode) throw new ValidationError(400, 'The topicCode is required');
        if (!body.context) throw new ValidationError(400, 'The context is required');
        if (!body.toRemember || !Array.isArray(body.toRemember)) throw new ValidationError(400, 'The toRemember array is required');

        return new JuiceChallenge({
            topicId: body.topicId,
            topicCode: body.topicCode,
            context: body.context,
            toRemember: body.toRemember
        });
    }

    public toMongoDoc() {
        return {
            type: this.type,
            topicId: this.topicId,
            topicCode: this.topicCode,
            context: this.context,
            toRemember: this.toRemember
        };
    }

}

interface ToRemember {
    toRemember: string;
    date?: SplitDate | null;
}

interface SplitDate {
    day: number | null;
    month: number | null;
    year: number | null;
}