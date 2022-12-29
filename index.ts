import cfg from './config.js';
import './db/connect.js';
import { JobsWatcher } from './controllers/jobs.js';
import { DataTypesUtils } from './services/utils.js';
import { HttpRequester } from './services/http_requests.js';

const jobsWatcher = new JobsWatcher();
jobsWatcher.watchJobs();