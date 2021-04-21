import RSSItem from "./RSSItem";

export default class Feed {
    private feed: Array<RSSItem>;
    private url: string;
    private lastSync: Date;

    constructor(url: string, lastSync: Date) {
        this.url = url;
        this.lastSync = lastSync;
    }
}
