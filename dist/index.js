import './db/connect.js';
import { JobsWatcher } from './controllers/jobs.js';
const jobsWatcher = new JobsWatcher();
jobsWatcher.watchJobs();
