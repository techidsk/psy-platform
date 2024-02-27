/**
 * 提供对自定义的 psy:// 协议的解析。
 * 基本格式为 psy://resoucename/querypath
 *
 * e.g psy://avatar/wendaolee
 * e.g psy://photo/experiment/
 * 该字符串主要用于实现对资源的定位获取，主要用于后端API处理。
 *
 * 由于该对象可能在客户端侧（浏览器环境下）使用，因此不适用使用URL对象进行解析——Browser和Nodejs环境中的二者行为不同。
 */

import { getUrl } from './url';

export enum PsyResouceName {
    Avatar = 'avatar',
    Photo = 'photo',
}

export class PsyProtocol {
    targetURLStr: string;
    isLegeal: Boolean;
    resouceName: string | undefined;
    queryPathArr: Array<string> | undefined;
    quertPath: string | undefined;

    /**
     * 传入形如`psy://resoucename/querypath`的字符串。
     * @param pysUrl
     */
    constructor(pysUrl: string) {
        this.targetURLStr = pysUrl;
        this.isLegeal = /^psy:\/\/[^\/\s]+(?:\/[^\/\s]+)*$/.test(pysUrl);
        if (this.isLegeal) {
            const parser = (pysStr: string) => {
                const resultArr = pysStr.slice(6).split('/');
                const resouceName = resultArr.shift();

                if (resultArr.length == 0) {
                    return {
                        resouceName: resouceName,
                        resoucePath: null,
                    };
                }
                return {
                    resouceName: resouceName,
                    queryPathArr: resultArr,
                    queryPath: resultArr.join('/'),
                };
            };

            const { resouceName, queryPathArr, queryPath } = parser(pysUrl);

            this.resouceName = resouceName;
            this.queryPathArr = queryPathArr;
            this.quertPath = queryPath;
            return this;
        }
    }

    /**
     * 获取请求对应资源的Promise对象
     * @returns {Promise<Response>}
     */
    fetchResouce() {
        return fetch(getUrl(`/api/psy?url=${this.targetURLStr}`));
    }

    /**
     * 静态方法，用于直接通过传入资源名与查询路径获取符合psy协议规格的字符串。
     * @param resouceName
     * @param queryPathArr
     */
    static getProtocolString(resouceName: string, queryPathArr?: [string]) {
        if (queryPathArr == undefined) {
            return `psy://${resouceName}`;
        }
        return `psy://${resouceName}/${queryPathArr.join('/')}`;
    }

    /**
     * 静态方法，用于传入psy协议字符串判断其是否合法
     * @param str
     * @returns {boolean}
     */
    static isStringLegal(str: string) {
        return /^psy:\/\/[^\/\s]+(?:\/[^\/\s]+)*$/.test(str);
    }
}
