"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackError = exports.sendSlackAlert = void 0;
const web_api_1 = require("@slack/web-api");
const logging_1 = require("@gitmesh/logging");
const conf_1 = require("../conf");
const log = (0, logging_1.getServiceChildLogger)('slackClient');
let slackClientInstance;
if (conf_1.SLACK_CONFIG.reporterToken && conf_1.SLACK_CONFIG.reporterChannel) {
    slackClientInstance = new web_api_1.WebClient(conf_1.SLACK_CONFIG.reporterToken);
}
const sendSlackAlert = async (text) => {
    if (slackClientInstance) {
        await slackClientInstance.chat.postMessage({
            channel: conf_1.SLACK_CONFIG.reporterChannel,
            text,
            username: 'Alert Reporter',
            icon_emoji: ':warning:',
        });
    }
    else {
        log.warn('No Slack client defined! Can not send a slack message!');
    }
};
exports.sendSlackAlert = sendSlackAlert;
const sendSlackError = async (source, error) => {
    if (slackClientInstance) {
        await slackClientInstance.chat.postMessage({
            channel: conf_1.SLACK_CONFIG.reporterChannel,
            text: `Error from ${source}:`,
            username: 'Error Reporter',
            icon_emoji: ':warning:',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `\`\`\`${JSON.stringify(error, null, 2)}\`\`\``,
                    },
                },
            ],
        });
    }
};
exports.sendSlackError = sendSlackError;
//# sourceMappingURL=slack.js.map