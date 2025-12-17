
/**
 * Abstract base class for Tome Challenges.
 */
export abstract class TomeChallenge {

    public abstract type: string;
    public abstract context: string; 
    public abstract topicId: string;
    public abstract topicCode: string;
    public abstract sectionCode: string;
    public abstract name: string;
    public abstract description: string;

    public abstract toMongoDoc(): any;

}
