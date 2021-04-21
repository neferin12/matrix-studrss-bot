import RSSItem from "./RSSItem";
import Parser from "rss-parser"
import {Database} from "../db";
import Client from "../matrix/Client";

export default class Feed {
    private feed: Array<RSSItem> = [];
    private url: string;
    private parser: Parser;
    private lastSync: Date;
    readonly roomID: string;

    constructor(url: string, roomID: string, lastSync: Date = new Date(0)) {
        this.lastSync = lastSync;
        this.setUrl(url);
        this.roomID = roomID;
    }

    setUrl(url: string): void {
        if (!url) return;
        this.url = url;
        this.parser = new Parser();
    }

    startSync(db: Database, client: Client): void {
        console.log("sync")
        this.getFeed(db).then(res => {
            for (const item of res) {
                client.sendHTMLMessage(item.buildHTMLMessage(), this.roomID);
            }
        }).catch(console.error).finally(() => setTimeout(() => this.startSync.call(this, db, client), 1000*60));
    }

    private getFeed(db: Database): Promise<Array<RSSItem>> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                const data: Array<Parser.Item> = (await this.parser.parseURL(this.url)).items;
                for (const datum of data) {
                    this.feed.push(new RSSItem(datum));
                }
                this.feed = this.feed.filter(item => {
                    if (!(item.date instanceof Date && this.lastSync instanceof Date)) {
                        reject("Not Dates");
                    }
                    return item.date > this.lastSync
                });

                this.lastSync = new Date();
                db.setEntry(this.roomID, {date: this.lastSync, url: this.url})
                resolve(this.feed);
            } catch (e) {
                reject(e);
            }
        });
    }
}
