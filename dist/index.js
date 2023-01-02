import './db/connect.js';
import { JobsWatcher } from './controllers/jobs.js';
import { DataBase } from './db/connect.js';
(async () => {
    try {
        await DataBase.initialize();
        console.log('Connected to a database.');
        const jobsWatcher = new JobsWatcher();
        jobsWatcher.watchJobs(false);
    }
    catch (err) {
        throw new Error(`Could not connect to database ${err.message}`);
    }
})();
// cron
// jobsWatcher.watchJobs(false);
//# sourceMappingURL=index.js.map