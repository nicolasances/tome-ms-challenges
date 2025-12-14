import { TotoAPIController } from "toto-api-controller";
import { ControllerConfig } from "./Config";
import { PostChallenge } from "./dlg/PostChallenge";
import { GetTopicChallenges } from "./dlg/GetTopicChallenges";

const api = new TotoAPIController(new ControllerConfig({ apiName: "tome-ms-challenges" }, {defaultHyperscaler: "aws", defaultSecretsManagerLocation: "aws"}), { basePath: '/tomechallenges' });

api.path('POST', '/challenges', new PostChallenge());

api.path('GET', '/topics/:topicId/challenges', new GetTopicChallenges());

api.init().then(() => {
    api.listen()
});