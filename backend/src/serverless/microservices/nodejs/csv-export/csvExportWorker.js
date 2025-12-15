"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvExportWorker = void 0;
const moment_1 = __importDefault(require("moment"));
const json2csv_1 = require("json2csv");
const protocol_http_1 = require("@aws-sdk/protocol-http");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const hash_node_1 = require("@aws-sdk/hash-node");
const url_parser_1 = require("@aws-sdk/url-parser");
const util_format_url_1 = require("@aws-sdk/util-format-url");
const logging_1 = require("@gitmesh/logging");
const getUserContext_1 = __importDefault(require("../../../../database/utils/getUserContext"));
const emailSender_1 = __importDefault(require("../../../../services/emailSender"));
const conf_1 = require("../../../../conf");
const messageTypes_1 = require("../messageTypes");
const getStage_1 = __importDefault(require("../../../../services/helpers/getStage"));
const aws_1 = require("../../../../services/aws");
const memberService_1 = __importDefault(require("../../../../services/memberService"));
const userRepository_1 = __importDefault(require("../../../../database/repositories/userRepository"));
const log = (0, logging_1.getServiceChildLogger)('csvExportWorker');
/**
 * Sends weekly analytics emails of a given tenant
 * to all users of the tenant.
 * Data sent is for the last week.
 * @param tenantId
 */
async function csvExportWorker(entity, userId, tenantId, segmentIds, criteria) {
    const fields = [
        'id',
        'username',
        'displayName',
        'emails',
        'score',
        'joinedAt',
        'activeOn',
        'identities',
        'tags',
        'notes',
        'organizations',
        'activityCount',
        'lastActive',
        'reach',
        'averageSentiment',
        'score',
        'attributes',
    ];
    const opts = { fields };
    // get the data without limits
    const userContext = await (0, getUserContext_1.default)(tenantId, null, segmentIds);
    let data = null;
    switch (entity) {
        case messageTypes_1.ExportableEntity.MEMBERS: {
            const memberService = new memberService_1.default(userContext);
            data = await memberService.queryForCsv(criteria);
            break;
        }
        default:
            throw new Error(`Unrecognized exportable entity ${entity}`);
    }
    if (!data || !data.rows) {
        const message = `Unable to retrieve data to export as CSV, exiting..`;
        log.error(message);
        return {
            status: 400,
            msg: message,
        };
    }
    const csv = await (0, json2csv_1.parseAsync)(data.rows, opts);
    const key = `csv-exports/${(0, moment_1.default)().format('YYYY-MM-DD')}_${entity}_${tenantId}.csv`;
    log.info({ tenantId, entity }, `Uploading csv to s3..`);
    const privateObjectUrl = await uploadToS3(csv, key);
    log.info({ tenantId, entity }, 'CSV uploaded successfully.');
    log.info({ tenantId, entity }, `Generating pre-signed url..`);
    const url = await getPresignedUrl(privateObjectUrl);
    log.info({ tenantId, entity, url }, `Url generated successfully.`);
    log.info({ tenantId, entity }, `Sending e-mail with pre-signed url..`);
    const user = await userRepository_1.default.findById(userId, userContext);
    await new emailSender_1.default(emailSender_1.default.TEMPLATES.CSV_EXPORT, { link: url }).sendTo(user.email);
    log.info({ tenantId, entity, email: user.email }, `CSV export e-mail with download link sent.`);
    return {
        status: 200,
        msg: `CSV export e-mail sent!`,
    };
}
exports.csvExportWorker = csvExportWorker;
async function uploadToS3(csv, key) {
    try {
        await aws_1.s3
            .putObject({
            Bucket: `${conf_1.S3_CONFIG.microservicesAssetsBucket}-${(0, getStage_1.default)()}`,
            Key: key,
            Body: csv,
        })
            .promise();
        return `https://${conf_1.S3_CONFIG.microservicesAssetsBucket}-${(0, getStage_1.default)()}.s3.${conf_1.S3_CONFIG.aws.region}.amazonaws.com/${key}`;
    }
    catch (error) {
        log.error(error, 'Error on uploading CSV file!');
        throw error;
    }
}
async function getPresignedUrl(objectUrl) {
    try {
        const awsS3ObjectUrl = (0, url_parser_1.parseUrl)(objectUrl);
        const presigner = new s3_request_presigner_1.S3RequestPresigner({
            credentials: {
                accessKeyId: conf_1.S3_CONFIG.aws.accessKeyId,
                secretAccessKey: conf_1.S3_CONFIG.aws.secretAccessKey,
            },
            region: conf_1.S3_CONFIG.aws.region,
            sha256: hash_node_1.Hash.bind(null, 'sha256'),
        });
        const url = (0, util_format_url_1.formatUrl)(await presigner.presign(new protocol_http_1.HttpRequest(awsS3ObjectUrl)));
        return url;
    }
    catch (error) {
        log.error(error, 'Error on creating pre-signed url!');
        throw error;
    }
}
//# sourceMappingURL=csvExportWorker.js.map