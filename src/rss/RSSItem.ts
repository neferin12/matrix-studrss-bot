import Parser from "rss-parser";

export default class RSSItem {
    title: string;
    info: string;
    subTitle: string;
    content: string;
    date: Date;
    link: string;


    constructor(item: Parser.Item) {
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

    buildHTMLMessage(): string {
        return `<h3 style="margin-bottom: 0">${this.title}</h3><p style="margin-top: 2px; color: lightgray"><b>${this.subTitle || ""}</b></p><p>${this.info}</p><hr><p>${this.content}</p><br><a href="${this.link}">Mehr</a>`
    }
}
