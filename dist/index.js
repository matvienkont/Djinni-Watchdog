import cron from 'cron';
import './db/connect.js';
import { JobsWatcher } from './controllers/jobs.js';
import { DataBase } from './db/connect.js';
const startJobWatcherCron = (jobsWatcher) => new cron.CronJob('* * * * *', () => jobsWatcher.watchJobs(false), null, true);
(async () => {
    try {
        await DataBase.initialize();
        console.log('Connected to a database.');
        const jobsWatcher = new JobsWatcher();
        jobsWatcher.watchJobs(true);
        startJobWatcherCron(jobsWatcher);
    }
    catch (err) {
        throw new Error(`Could not connect to database ${err.message}`);
    }
})();
//# sourceMappingURL=index.js.map