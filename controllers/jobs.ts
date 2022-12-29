import cfg from "../config.js";
import { DataBase } from "../db/connect.js";
import { Job } from "../db/entity/job.entity.js";
import { HttpRequester } from "../services/http_requests.js";
import { Extractors, DataTypesUtils } from "../services/utils.js";
import { HTMLElement } from 'node-html-parser';

const http = new HttpRequester();

// export class Job {
//     jobId: number;
//     jobTitle: string;

//     constructor(jobId: number, jobTitle: string) {
//         this.jobId = jobId;
//         this.jobTitle = jobTitle;
//     }

//     showDescription () {
//         console.log(this.jobId, this.jobTitle);
//     }
// }

export class JobsWatcher {
    async watchJobs () {
        const funcName = '[watchJobs]';
        let page = 0;
        do {
            try {
                const html = await this.getHtmlOfJobs(0);
                if (DataTypesUtils.isString(html)) {
                    const jobs = this.retriveUnseenJobsFromHtml(html);
                }
            } catch (err) {
                console.error(funcName, err);
            }
        } while (page)
    }

    async getHtmlOfJobs (page: number) {
        const funcName = '[getHtmlOfJobs]';
        const url = page ? cfg.trackingUrl + `&page${page}` : cfg.trackingUrl;
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

    async retriveLatestSeenJobId (): Promise<number | undefined> {
        const funcName = '[retriveLatestSeenJobId]';
        try {
            const lastSeenJob = await DataBase.manager.findOne(Job, { where: {}, order: { date: 'DESC' }});
            return lastSeenJob?.id;
        } catch (err) {
            console.error(funcName, 'Error finding last seen job from the database');
        }
        return undefined;
    }

    async retriveUnseenJobsFromHtml (html: string) {
        const funcName = '[extractJobData]';

        const jobsSelector = '.list-jobs__item.list__item', parentSelector = '.list-unstyled.list-jobs';
        const nodeJobs = Extractors.extractNodeFromText(html, jobsSelector, parentSelector);
        if (!nodeJobs) {
            console.error(funcName, 'No job nodes found from an html text');
            return undefined;
        }

        const jobs: Job[] = [];
        const latestSeenJobId = await this.retriveLatestSeenJobId();
        for (const node of nodeJobs) {
            const titleEl = Extractors.pickElement(node, '.profile');
            const jobId = Number(titleEl?.getAttribute('href')?.match(/\d+?(?=-)/gm)?.[0]);
            const jobTitle = titleEl?.text?.trim();

            if (jobId && latestSeenJobId === jobId) {
                break;
            }

            if (!jobId || !jobTitle) {
                console.error(funcName, 'No jobId or jobTitle', 'JobId:', jobId, 'jobTitle', jobTitle);
                continue;
            }

            jobs.push(DataBase.manager.create(Job, { id: jobId, title: jobTitle, seen: false }));
        }

        return jobs;
    }
}