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
    private db: Database;
    private client: Client;
    private interval: NodeJS.Timer;

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

    private synchronize(): void {
        console.log("sync")
        this.getFeed().then(async res => {
            for (const item of res) {
                await this.client.sendHTMLMessage(item.buildHTMLMessage(), this.roomID);
            }
        }).catch(console.error);
    }

    startSync(db: Database, client: Client): void {
        this.db = db;
        this.client = client;
        this.interval = setInterval(() => this.synchronize.call(this, db, client), 1000 * 60);
    }

    private async getFeed(): Promise<Array<RSSItem>> {
        const data: Array<Parser.Item> = (await this.parser.parseURL(this.url)).items;
        for (const datum of data) {
            this.feed.push(new RSSItem(datum));
        }
        this.feed = this.feed.filter(item => {
            if (!(item.date instanceof Date && this.lastSync instanceof Date)) {
                throw new Error("Dates are not instances of Date")
            }
            return item.date > this.lastSync
        });

        this.lastSync = new Date();
        await this.db.setEntry(this.roomID, {roomID: this.roomID, date: this.lastSync, url: this.url})
        return this.feed;
    }
}
