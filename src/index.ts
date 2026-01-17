import { TotoAPIController } from "toto-api-controller";
import { ControllerConfig } from "./Config";
import { PostChallenge } from "./dlg/PostChallenge";
import { GetTopicChallenges } from "./dlg/GetTopicChallenges";
import { PostTrial } from "./dlg/trials/PostTrial";
import { GetChallenge } from "./dlg/GetChallenge";
import { GetTrial } from "./dlg/trials/GetTrial";
import { PostAnswer } from "./dlg/trials/PostAnswer";
import { GetTrials } from "./dlg/trials/GetTrials";
import { RecalculateTrialScore } from "./dlg/trials/RecalculateTrialScore";
import { GetChallenges } from "./dlg/GetChallenges";
import { DeleteTrial } from "./dlg/trials/DeleteTrial";

const api = new TotoAPIController(new ControllerConfig({ apiName: "tome-ms-challenges" }, {defaultHyperscaler: "aws", defaultSecretsManagerLocation: "aws"}), { basePath: '/tomechallenges' });

api.path('POST', '/challenges', new PostChallenge());
api.path('GET', '/challenges', new GetChallenges());
api.path('GET', '/challenges/:challengeId', new GetChallenge());

api.path('GET', '/topics/:topicId/challenges', new GetTopicChallenges());

api.path('POST', '/trials', new PostTrial());
api.path('GET', '/trials', new GetTrials());
api.path('GET', '/trials/:trialId', new GetTrial());
api.path('DELETE', '/trials/:trialId', new DeleteTrial());
api.path('POST', '/trials/:trialId/answers', new PostAnswer());
api.path('GET', '/trials/:trialId/score', new RecalculateTrialScore());

api.init().then(() => {
    api.listen()
});