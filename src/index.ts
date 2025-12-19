import { TotoAPIController } from "toto-api-controller";
import { ControllerConfig } from "./Config";
import { PostChallenge } from "./dlg/PostChallenge";
import { GetChallenges } from "./dlg/GetChallenges";
import { PostTrial } from "./dlg/trials/PostTrial";

const api = new TotoAPIController(new ControllerConfig({ apiName: "tome-ms-challenges" }, {defaultHyperscaler: "aws", defaultSecretsManagerLocation: "aws"}), { basePath: '/tomechallenges' });

api.path('POST', '/challenges', new PostChallenge());

api.path('GET', '/topics/:topicId/challenges', new GetChallenges());

api.path('POST', '/trials', new PostTrial());

api.init().then(() => {
    api.listen()
});