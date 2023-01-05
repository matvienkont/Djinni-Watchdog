import cfg from "../config.js";
import { DJINNI_SELECTORS, DJINNI_TRACKING_URL } from "../constants.js";
import { DataBase } from "../db/connect.js";
import { Job } from "../db/entity/job.entity.js";
import { HttpRequester } from "../services/http_requests.js";
import { Extractors, DataTypesUtils, TimeUtils } from "../services/utils.js";
import { HTMLElement } from 'node-html-parser';

const http = new HttpRequester();
const JOBS_PER_PAGE = 15;

export class JobsWatcher {
    async watchJobs (firstStart: boolean) {
        const funcName = '[watchJobs]';
        let page = 0;
        let unseenJobs: Job[] = [];

        try {
            console.log(funcName, 'Starting looking for new jobs...');
            const latestSeenJobId = await this.retriveLatestSeenJobId();
            do {
                    const htmlPage = await this.getHtmlPageOfJobs(page);
                    const { unseenJobsOnPage, toContinueSearching, totalJobs } = await this.retriveUnseenJobsFromHtml(htmlPage, latestSeenJobId);
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
                await this.sendTgNotifications(unseenJobs);
            }
        } else {
            console.log(funcName, 'No new jobs found.');
        }
    }

    async getHtmlPageOfJobs (page: number) {
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

    async retriveUnseenJobsFromHtml (html: string, latestSeenJobId: number | undefined) {
        const funcName = '[extractJobData]';
        let toContinueSearching = true;
        const totalJobs = Number(Extractors.extractNodeFromText(html, DJINNI_SELECTORS.pagesSelector)?.[0]?.innerText);

        const nodeJobs = Extractors.extractNodeFromText(html, DJINNI_SELECTORS.jobsSelector, DJINNI_SELECTORS.parentJobsSelector);
        if (!nodeJobs) {
            console.error(funcName, 'No job nodes found from an html text');
            toContinueSearching = false;
            return { unseenJobsOnPage: [], toContinueSearching, totalJobs: 0 };
        }

        const unseenJobsOnPage: Job[] = [];
        for (const node of nodeJobs) {
            const titleEl = Extractors.pickElement(node, DJINNI_SELECTORS.profileSelector);
            const jobTitle = titleEl?.text?.trim();
            const jobUrl = titleEl?.getAttribute('href'), jobId = Number(jobUrl?.match(/\d+?(?=-)/gm)?.[0]);
            const company = Extractors.pickElement(node, DJINNI_SELECTORS.companySelector)?.text?.trim();
            const recruiter = Extractors.pickElement(node, DJINNI_SELECTORS.recruiterSelector)?.text?.trim()?.replace('\n        ', ' ');
            const description = Extractors.pickElement(node, DJINNI_SELECTORS.descriptionSelector)?.text?.trim();

            if (jobId && latestSeenJobId === jobId) {
                toContinueSearching = false;
                break;
            }

            if (!jobId || !jobTitle) {
                console.error(funcName, 'No jobId or jobTitle', 'JobId:', jobId, 'jobTitle', jobTitle);
                continue;
            }

            unseenJobsOnPage.push(DataBase.manager.create(Job, { jobId, jobUrl, title: jobTitle, company, recruiter, description }));
        }

        return { unseenJobsOnPage, totalJobs, toContinueSearching };
    }

    async retriveLatestSeenJobId (): Promise<number | undefined> {
        const funcName = '[retriveLatestSeenJobId]';
        try {
            const lastSeenJob = await DataBase.manager.findOne(Job, { select: { jobId: true }, where: {}, order: { id: 'DESC' }});
            return lastSeenJob?.jobId;
        } catch (err: any) {
            console.error(funcName, 'Error finding last seen job from the database', err.message);
        }
        return undefined;
    }

    async saveUnseenJobs (jobs: Job[]) {
        const funcName = '[saveUnseenJobs]';
        try {
            const insertResults = await DataBase.manager.upsert(Job, jobs, ['jobId', 'jobUrl']);
            console.log(funcName, 'Successfully saved unseen', insertResults.identifiers.length, 'jobs');
        } catch (err: any) {
            console.error(funcName, 'Error saving unseen jobs into the database', err.message);
        }
    }

    async sendTgNotifications (jobs: Job[]) {
        for (const job of jobs) {
            const message = `<b>New Job Alert</b>\n\n${job.title}\n\n${job.company}. ${job.recruiter}\n\n${job.description}\n\n<a href="https://djinni.co${job.jobUrl}">Djinni</a>`
            await TimeUtils.sleepMs(100);
            HttpRequester.sendTelegramMessage(message, true);
        }
    }
}