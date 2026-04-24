import { TotoControllerConfig, APIOptions, SecretsManager } from "totoms";

const dbName = 'tomechallenges';
const collections = {
    challenges: 'challenges',  // Collection for storing challenges
    trials: 'trials',          // Collection for storing trials, which are attempts at challenges
    settings: 'settings'       // Collection for storing microservice settings
};

export class ControllerConfig extends TotoControllerConfig {

    constructor(secretsManager: SecretsManager) {
        super(secretsManager);
    }

    getMongoSecretNames(): { userSecretName: string; pwdSecretName: string; } | null {
        return {
            userSecretName: 'tome-ms-challenges-mongo-user',
            pwdSecretName: 'tome-ms-challenges-mongo-pswd'
        };
    }

    getProps(): APIOptions {
        return {
            customAuthProvider: "toto"
        };
    }

    getDBName() { return dbName }
    getCollections() { return collections }

}