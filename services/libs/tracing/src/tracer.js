"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceTracer = void 0;
const api_1 = __importDefault(require("@opentelemetry/api"));
const sdk_node_1 = require("@opentelemetry/sdk-node");
const exporter_trace_otlp_grpc_1 = require("@opentelemetry/exporter-trace-otlp-grpc");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const resource_detector_aws_1 = require("@opentelemetry/resource-detector-aws");
const instrumentation_bunyan_1 = require("@opentelemetry/instrumentation-bunyan");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const instrumentation_express_1 = require("@opentelemetry/instrumentation-express");
const instrumentation_aws_sdk_1 = require("@opentelemetry/instrumentation-aws-sdk");
const opentelemetry_instrumentation_kafkajs_1 = require("opentelemetry-instrumentation-kafkajs");
const instrumentation_redis_4_1 = require("@opentelemetry/instrumentation-redis-4");
const opentelemetry_instrumentation_sequelize_1 = require("opentelemetry-instrumentation-sequelize");
const instrumentation_pg_1 = require("@opentelemetry/instrumentation-pg");
let sdk;
let isInitialized = false;
const getServiceTracer = () => {
    const service = process.env['SERVICE'];
    if (!service) {
        throw new Error('Environment variable `SERVICE` is not set');
    }
    if (isInitialized) {
        return api_1.default.trace.getTracer(service);
    }
    const attrs = {
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: service,
    };
    // Apply specific resource attributes if process is running in Kubernetes.
    // This is not handled by AWS resource detectors.
    if (process.env['KUBE_MODE'] == '1') {
        attrs[semantic_conventions_1.SemanticResourceAttributes.K8S_POD_NAME] = process.env['HOSTNAME'];
    }
    sdk = new sdk_node_1.NodeSDK({
        traceExporter: new exporter_trace_otlp_grpc_1.OTLPTraceExporter(),
        resource: new resources_1.Resource(attrs),
        autoDetectResources: true,
        resourceDetectors: [resource_detector_aws_1.awsEc2Detector, resource_detector_aws_1.awsEcsDetector, resource_detector_aws_1.awsEksDetector],
        instrumentations: [
            new instrumentation_bunyan_1.BunyanInstrumentation(),
            new instrumentation_http_1.HttpInstrumentation(),
            new instrumentation_express_1.ExpressInstrumentation(),
            new instrumentation_aws_sdk_1.AwsInstrumentation(),
            new opentelemetry_instrumentation_kafkajs_1.KafkaJsInstrumentation(),
            new instrumentation_redis_4_1.RedisInstrumentation(),
            new opentelemetry_instrumentation_sequelize_1.SequelizeInstrumentation(),
            new instrumentation_pg_1.PgInstrumentation(),
        ],
    });
    isInitialized = true;
    sdk.start();
    return api_1.default.trace.getTracer(service);
};
exports.getServiceTracer = getServiceTracer;
process.on('SIGTERM', async () => {
    await gracefulShutdown();
});
process.on('SIGINT', async () => {
    await gracefulShutdown();
});
async function gracefulShutdown() {
    try {
        await sdk.shutdown();
        console.log('Tracing successfully finished');
    }
    catch (err) {
        console.log('Error terminating tracing', err);
    }
    finally {
        process.exit(0);
    }
}
//# sourceMappingURL=tracer.js.map