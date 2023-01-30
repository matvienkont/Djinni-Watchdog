import { Dictionary } from "ts-essentials";
import { DJINNI_SELECTORS, DJINNI_TRACKING_URL } from "../constants.js";
import { DataBase } from "../db/connect.js";
import { Job } from "../db/entity/job.entity.js";
import { HttpRequester } from "../services/http_requests.js";
import { Extractors, DataTypesUtils, TimeUtils } from "../services/utils.js";

const http = new HttpRequester();
const JOBS_PER_PAGE = 15;
const DbManager = DataBase.manager;

export class JobsWatcher {
    public async watchJobs (firstStart: boolean) {
        const funcName = '[watchJobs]';
        let page = 0;
        let unseenJobs: Job[] = [];

        try {
            console.log(funcName, 'Starting looking for new jobs...');
            do {
                    const htmlPage = await this.getHtmlPageOfJobs(page);
                    const { unseenJobsOnPage, toContinueSearching, totalJobs } = await this.retriveUnseenJobsFromHtml(htmlPage);
                    if (unseenJobsOnPage && unseenJobsOnPage.length) {
                        unseenJobs = [...unseenJobsOnPage.reverse(), ...unseenJobs];
                    }
                    if (toContinueSearching && totalJobs && (page + 1) * JOBS_PER_PAGE < totalJobs) page++; else page = 0;

            } while (page)
        } catch (err) {
            console.error(funcName, err);
        }

        if (unseenJobs.length) {
            await this.saveUnseenJobs(unseenJobs);
            if (!firstStart) {
                await this.notifyNewJobsToTg(unseenJobs);
            }
        } else {
            console.log(funcName, 'No new jobs found.');
        }
    }

    private async getHtmlPageOfJobs (page: number) {
        const funcName = '[getHtmlPageOfJobs]';
        const url = page ? DJINNI_TRACKING_URL + `&page=${++page}` : DJINNI_TRACKING_URL;
        try {
            const response = await http.get(url);
            if (DataTypesUtils.isString(response.data)) {
                return response.data;
            } else {
                console.error(funcName, 'Not a string text', response.data);
                throw new Error('Response from djinni is not an html text');
            }
        } catch (err: any) {
            throw new Error(`${funcName} Response from Djinni is invalid ${err.message}`);
        }
    }

    private async retriveUnseenJobsFromHtml (html: string) {
        const funcName = '[extractJobData]';
        let toContinueSearching = true;
        const totalJobs = Number(Extractors.extractNodeFromText(html, DJINNI_SELECTORS.pagesSelector)?.[0]?.innerText);

        const nodeJobs = Extractors.extractNodeFromText(html, DJINNI_SELECTORS.jobsSelector, DJINNI_SELECTORS.parentJobsSelector);
        if (!nodeJobs) {
            console.error(funcName, 'No job nodes found from an html text');
            toContinueSearching = false;
            return { unseenJobsOnPage: [], toContinueSearching, totalJobs: 0 };
        }

        const jobsOnPage: Job[] = [];
        for (const node of nodeJobs) {
            const titleEl = Extractors.pickElement(node, DJINNI_SELECTORS.profileSelector);
            const jobUrl = titleEl?.getAttribute('href');

            const job = {
                title: titleEl?.text?.trim(),
                jobUrl,
                jobId: Number(jobUrl?.match(/\d+?(?=-)/gm)?.[0]),
                company: Extractors.pickElement(node, DJINNI_SELECTORS.companySelector)?.text?.trim(),
                recruiter: Extractors.pickElement(node, DJINNI_SELECTORS.recruiterSelector)?.text?.trim()?.replace('\n        ', ' '),
                description: Extractors.pickElement(node, DJINNI_SELECTORS.descriptionSelector)?.innerHTML?.trim()?.replaceAll('<br>', '\n'),
            }

            console.log(job);

            if (!this.validateJobProperties(job)) {
                console.error(funcName, 'Job object is invalid', JSON.stringify(job));
                continue;
            }

            jobsOnPage.push(job);
        }

        const jobIds = jobsOnPage.map(job => job.jobId);
        const seenJobsOnThisPage = await this.retriveSeenJobIdsByJobId(jobIds)
        const unseenJobsOnPage: Job[] = [];
        for (const job of jobsOnPage) {
            const { jobId } = job;
            if (jobId && seenJobsOnThisPage.includes(jobId)) {
                toContinueSearching = false;
                break;
            }

            unseenJobsOnPage.push(DbManager.create(Job, job));
        }

        return { unseenJobsOnPage, totalJobs, toContinueSearching };
    }

    private async retriveSeenJobIdsByJobId (possiblyUnseenJobs: number[]) {
        const funcName = '[retriveLatestSeenJobId]';
        try {
            const lastSeenJobs = await DbManager.createQueryBuilder()
                .select('"jobId"')
                .from(Job, 'job')
                .orderBy({ id: 'DESC' })
                .where('job."jobId" IN (:...jobIds)', { jobIds: possiblyUnseenJobs })
                .execute();
            return lastSeenJobs.map((job: Dictionary<number>) => job.jobId);
        } catch (err: any) {
            console.error(funcName, 'Error finding last seen job from the database', err.message);
        }
        return undefined;
    }

    private async saveUnseenJobs (jobs: Job[]) {
        const funcName = '[saveUnseenJobs]';
        const jobIds = jobs.map(job => job.jobId);
        try {
            await DbManager.transaction(async (transactionalEntityManager) => {
                const deletedRepublishedJobs = await transactionalEntityManager.createQueryBuilder()
                        .delete()
                        .from(Job)
                        .where('jobId IN (:...jobIds)', { jobIds })
                        .execute();
                const insertResults = await transactionalEntityManager.insert(Job, jobs);
                console.log(funcName, 'Deleted republished jobs:', deletedRepublishedJobs.affected, '\nSuccessfully saved new published', insertResults.identifiers.length, 'jobs');
            });
        } catch (err: any) {
            console.error(funcName, 'Error saving unseen jobs into the database', err.message);
        }
    }

    private async notifyNewJobsToTg (jobs: Job[]) {
        for (const job of jobs) {
            const message = `<b>New Job Alert</b>\n\n${job.title}\n\n${job.company}. ${job.recruiter}\n\n${job.description}\n\n<a href="https://djinni.co${job.jobUrl}">Djinni</a>`
            await TimeUtils.sleepMs(100);
            HttpRequester.sendTelegramMessage(message, true);
        }
    }

    private validateJobProperties (job: Partial<Job>): job is Job {
        let property: keyof Job;
        for (property in job) {
            if (!job[property]) {
                console.error(job[property], 'does not exist in job object', JSON.stringify(job));
                return false;
            }
        }
        return true;
    }
}