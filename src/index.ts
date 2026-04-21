import { TotoMicroservice, TotoMicroserviceConfiguration, SupportedHyperscalers, getHyperscalerConfiguration } from "totoms";
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
import { GetSettings } from "./dlg/settings/GetSettings";
import { UpdateTrialScorerConfiguration } from "./dlg/settings/UpdateTrialScorerConfiguration";

const config: TotoMicroserviceConfiguration = {
    serviceName: "tome-ms-challenges",
    basePath: '/tomechallenges',
    environment: {
        hyperscaler: (process.env.HYPERSCALER as SupportedHyperscalers) || "aws",
        hyperscalerConfiguration: getHyperscalerConfiguration()
    },
    customConfiguration: ControllerConfig,
    apiConfiguration: {
        apiEndpoints: [
            { method: 'POST', path: '/challenges', delegate: PostChallenge },
            { method: 'GET', path: '/challenges', delegate: GetChallenges },
            { method: 'GET', path: '/challenges/:challengeId', delegate: GetChallenge },

            { method: 'GET', path: '/topics/:topicId/challenges', delegate: GetTopicChallenges },

            { method: 'POST', path: '/trials', delegate: PostTrial },
            { method: 'GET', path: '/trials', delegate: GetTrials },
            { method: 'GET', path: '/trials/:trialId', delegate: GetTrial },
            { method: 'DELETE', path: '/trials/:trialId', delegate: DeleteTrial },
            { method: 'POST', path: '/trials/:trialId/answers', delegate: PostAnswer },
            { method: 'GET', path: '/trials/:trialId/score', delegate: RecalculateTrialScore },

            { method: 'GET', path: '/settings', delegate: GetSettings },
            { method: 'PUT', path: '/settings/scorers/trial', delegate: UpdateTrialScorerConfiguration },
        ]
    }
};

TotoMicroservice.init(config).then((microservice: TotoMicroservice) => {
    microservice.start();
});