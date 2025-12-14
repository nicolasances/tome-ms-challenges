import { TotoAPIController } from "toto-api-controller";
import { ControllerConfig } from "./Config";
import { PostChallenge } from "./dlg/PostChallenge";

const api = new TotoAPIController(new ControllerConfig({ apiName: "tome-ms-challenges" }, {defaultHyperscaler: "aws", defaultSecretsManagerLocation: "aws"}), { basePath: '/tomechallenges' });

api.path('POST', '/challenges', new PostChallenge())

api.init().then(() => {
    api.listen()
});