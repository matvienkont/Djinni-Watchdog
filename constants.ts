export enum DJINNI_SELECTORS {
    profileSelector = '.profile',
    jobsSelector = '.list-jobs__item.list__item',
    parentJobsSelector = '.list-unstyled.list-jobs',
    pagesSelector = 'html body div.wrapper div.container div.page-header h1 span.text-muted',
    companySelector = 'div.list-jobs__details div.list-jobs__details__info a',
    recruiterSelector = 'div.list-jobs__details div.list-jobs__details__info a.link-muted',
    descriptionSelector = 'div.list-jobs__description.position-relative div.mw-100.fz-16.mb-0.js-show-more',
};

export const DJINNI_TRACKING_URL = 'https://djinni.co/jobs/?keywords=-fullstack+-full&all-keywords=&any-of-keywords=&exclude-keywords=&primary_keyword=Node.js&exp_level=2y&exp_level=3y&salary=1500';