export default class RSSItem {
    title: string;
    info: string;
    subTitle: string;
    content: string;
    date: Date;
    link: string;


    constructor(item) {
        try {
            const title = item.title.match(/\[(.*)]/i)[1];
            this.info = item.title.match(/\[(.*)](.*)/i)[2];
            const split = title.split(/>(.+)/);
            this.title = split[0];
            this.subTitle = split[1];
        } catch (e) {
            this.info = item.title;
        }
        this.content = item.content;
        this.date = new Date(item.pubDate);
        this.link = item.guid;
    }

}
