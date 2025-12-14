import { ValidationError } from "toto-api-controller";
import { TomeChallenge } from "../TomeChallenge";

export class JuiceChallenge extends TomeChallenge {

    public type: string = "juice";
    public topicId: string;
    public topicCode: string;
    public sectionCode: string;
    
    public context: string;
    public toRemember: ToRemember[];

    constructor({ topicId, topicCode, sectionCode, context, toRemember }: { topicId: string, topicCode: string, sectionCode: string, context: string, toRemember: ToRemember[] }) {
        super();
        this.topicId = topicId;
        this.topicCode = topicCode;
        this.sectionCode = sectionCode;
        this.context = context;
        this.toRemember = toRemember;
    }

    static fromMongoDoc(doc: any): JuiceChallenge {
        return new JuiceChallenge({
            topicId: doc.topicId,
            topicCode: doc.topicCode,
            sectionCode: doc.sectionCode,
            context: doc.context,
            toRemember: doc.toRemember
        });
    }

    static fromHTTPBody(body: any): JuiceChallenge {

        // Check mandatory fields
        if (!body.topicId) throw new ValidationError(400, 'The topicId is required');
        if (!body.topicCode) throw new ValidationError(400, 'The topicCode is required');
        if (!body.sectionCode) throw new ValidationError(400, 'The sectionCode is required');
        if (!body.context) throw new ValidationError(400, 'The context is required');
        if (!body.toRemember || !Array.isArray(body.toRemember)) throw new ValidationError(400, 'The toRemember array is required');

        return new JuiceChallenge({
            topicId: body.topicId,
            topicCode: body.topicCode,
            sectionCode: body.sectionCode,
            context: body.context,
            toRemember: body.toRemember
        });
    }

    public toMongoDoc() {
        return {
            type: this.type,
            topicId: this.topicId,
            topicCode: this.topicCode,
            sectionCode: this.sectionCode,
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