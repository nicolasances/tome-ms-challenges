import { MongoClient } from 'mongodb';
import { TotoControllerConfig, ValidatorProps, Logger, SecretsManager } from "toto-api-controller";

const dbName = 'tomechallenges';
const collections = {
    challenges: 'challenges',  // Collection for storing challenges
    trials: 'trials',          // Collection for storing trials, which are attempts at challenges
};

export class ControllerConfig extends TotoControllerConfig {

    mongoUser: string | undefined;
    mongoPwd: string | undefined;

    private static mongoClient: MongoClient | null = null;
    private static mongoClientPromise: Promise<MongoClient> | null = null;

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

        if (ControllerConfig.mongoClient) return ControllerConfig.mongoClient;

        // If connection is in progress, wait for it
        if (ControllerConfig.mongoClientPromise) return ControllerConfig.mongoClientPromise;

        const mongoUrl = `mongodb://${this.mongoUser}:${this.mongoPwd}@${this.mongoHost}:27017/${dbName}`;

        ControllerConfig.mongoClientPromise = new MongoClient(mongoUrl, {
            serverSelectionTimeoutMS: 5000,    // Fail fast on network issues
            socketTimeoutMS: 30000,            // Kill hung queries
            maxPoolSize: 80,                   // Up to 80 connections in the pool
        }).connect().then(client => {

            ControllerConfig.mongoClient = client;
            ControllerConfig.mongoClientPromise = null;

            return client;

        }).catch(error => {

            ControllerConfig.mongoClientPromise = null;

            throw error;
        });

        return ControllerConfig.mongoClientPromise;
    }

    /**
     * Closes the MongoDB connection pool.
     * Call this during application shutdown.
     */
    static async closeMongoClient(): Promise<void> {

        if (ControllerConfig.mongoClient) {

            await ControllerConfig.mongoClient.close();

            ControllerConfig.mongoClient = null;
        }
    }


    getDBName() { return dbName }
    getCollections() { return collections }

}

const shutdown = async () => {

    console.log('Shutting down gracefully...');

    await ControllerConfig.closeMongoClient();

    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);