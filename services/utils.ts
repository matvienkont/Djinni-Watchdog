import { Dictionary } from 'ts-essentials';
import { parse, HTMLElement } from 'node-html-parser';

export class DataTypesUtils {
    static isObj <T>(object: any): object is T {
        return typeof object === 'object' && object !== null;
    }

    static isNumber (v: any): v is number {
        return (typeof v === 'number' || v instanceof Number) && !isNaN(Number(v));
    }

    static isString (v: any): v is string {
        return typeof v === 'string' || v instanceof String;
    }
}

export class Extractors {
    static cookieStrToObj (cookiesStr: string) {
        return cookiesStr.split('; ').reduce((cookieObject: Dictionary<string>, cookieStr) => {
            const [key, value] = cookieStr.split('=');
            cookieObject[key] = value;
            return cookieObject;
        }, {});
    }

    static extractNodeFromText (htmlText: string, selector: string, parentSelector?: string) {
        const funcName = '[extractNodeFromText]';

        const root = parse(htmlText);
        if (!root) {
            console.error(funcName, 'Root of html text is invalid', htmlText.substring(0, 150));
            return undefined;
        }

        const parentNode: HTMLElement | null = parentSelector ? root.querySelector(parentSelector) : null;

        const nodes = (parentNode || root).querySelectorAll(selector);
        return nodes;
    }

    static pickElement (node: HTMLElement, selector: string, parentSelector?: string) {
        const parentNode: HTMLElement | null = parentSelector ? node.querySelector(parentSelector) : null;

        const data = (parentNode || node).querySelector(selector);
        return data;
    }
};