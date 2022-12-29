import axios from 'axios';
import { Extractors } from './utils.js';
import cfg from '../config.js';

export class HttpRequester {
    private getRequestOptions (url: string) {
        return {
            method: 'GET',
            url: url,
            headers: Extractors.cookieStrToObj(cfg.djinniDocumentCookie),
        }
    }

    async get (url: string) {
        const requestOptions = this.getRequestOptions(url);
        const response = await axios(requestOptions);
        return response;
    }
};
