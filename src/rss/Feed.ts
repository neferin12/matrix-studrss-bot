import RSSItem from "./RSSItem";
import Parser from "rss-parser"
import {Database} from "../db";

export default class Feed {
    private feed: Array<RSSItem> = [];
    private url: string;
    private parser: Parser;
    private lastSync: Date;
    private readonly roomID: string;

    constructor(url: string, roomID: string, lastSync: Date = new Date(0)) {
        this.lastSync = lastSync;
        this.setUrl(url);
        this.roomID = roomID;
    }

    setUrl(url: string): void {
        if(!url) return;
        this.url = url;
        this.parser = new Parser();
    }

    getFeed(db: Database): Promise<void> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try{
                const data: Array<Parser.Item> = (await this.parser.parseURL(this.url)).items;
                for (const datum of data) {
                    this.feed.push(new RSSItem(datum));
                }
                this.feed = this.feed.filter(item => item.date > this.lastSync);
                console.log(this.feed.length);
                this.lastSync = new Date();
                db.setEntry(this.roomID, {date: this.lastSync, url: this.url})
            }catch (e) {
                reject(e);
            }
        });
    }
}
