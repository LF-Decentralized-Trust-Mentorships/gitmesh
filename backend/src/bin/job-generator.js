"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const logging_1 = require("@gitmesh/logging");
const tracing_1 = require("@gitmesh/tracing");
const jobs_1 = __importDefault(require("./jobs"));
const tracer = (0, tracing_1.getServiceTracer)();
const log = (0, logging_1.getServiceLogger)();
for (const job of jobs_1.default) {
    const cronJob = new cron_1.CronJob(job.cronTime, async () => {
        await tracer.startActiveSpan(`ProcessingJob:${job.name}`, async (span) => {
            log.info({ job: job.name }, 'Triggering job.');
            try {
                await job.onTrigger(log);
                span.setStatus({
                    code: tracing_1.SpanStatusCode.OK,
                });
            }
            catch (err) {
                span.setStatus({
                    code: tracing_1.SpanStatusCode.ERROR,
                    message: err,
                });
                log.error(err, { job: job.name }, 'Error while executing a job!');
            }
            finally {
                span.end();
            }
        });
    }, null, true, 'Europe/Berlin');
    if (cronJob.running) {
        log.info({ job: job.name }, 'Scheduled a job.');
    }
}
//# sourceMappingURL=job-generator.js.map