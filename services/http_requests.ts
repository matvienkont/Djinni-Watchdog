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

    static async sendTelegramMessage (message: string, encode?: boolean) {
        const funcName = '[Service: Telegram]';
        const url = `https://api.telegram.org/bot${cfg.telegramBotToken}/sendMessage?chat_id=${cfg.telegramChatId}&parse_mode=HTML&text=${encode ? encodeURIComponent(message) : message}`;
        try {
            await axios.get(url);
        } catch (err: any) {
            console.error(funcName, 'Sending TG Notification', err.message ? err.message : JSON.stringify(err));
        }
    }
}
