import { MongoClient } from 'mongodb';
import { TotoControllerConfig, ValidatorProps, Logger, SecretsManager } from "toto-api-controller";

const dbName = 'tomechallenges';
const collections = {
    juice: 'juice', // For the Juice Challenges
};

export class ControllerConfig extends TotoControllerConfig {

    mongoUser: string | undefined;
    mongoPwd: string | undefined;

    async load(): Promise<any> {

        let promises = [];

        const sm = new SecretsManager(this.hyperscaler == 'local' ? 'aws' : this.hyperscaler, this.env, this.logger!);

        promises.push(super.load());

        // Other possible secrets to load:
        promises.push(sm.getSecret(`tome-ms-challenges-mongo-user`).then((value) => {
            this.mongoUser = value;
        }));
        promises.push(sm.getSecret(`tome-ms-challenges-mongo-pswd`).then((value) => {
            this.mongoPwd = value;
        }));

        await Promise.all(promises);

    }

    getProps(): ValidatorProps {
        return {}
    }

    async getMongoClient() {

        const mongoUrl = `mongodb://${this.mongoUser}:${this.mongoPwd}@${this.mongoHost}:27017/${dbName}`

        return await new MongoClient(mongoUrl).connect();
    }
    
    getDBName() { return dbName }
    getCollections() { return collections }

}
