import cfg from './config.js';
import './db/connect.js';
import { JobsWatcher } from './controllers/jobs.js';
import { DataTypesUtils } from './services/utils.js';
import { HttpRequester } from './services/http_requests.js';
import { DataBase } from './db/connect.js';

(async () => {
    try {
        await DataBase.initialize();
        console.log('Connected to a database.');

        const jobsWatcher = new JobsWatcher();
        jobsWatcher.watchJobs(false);
    } catch (err: any) {
        throw new Error(`Could not connect to database ${err.message}`);
    }
})();


// cron
// jobsWatcher.watchJobs(false);