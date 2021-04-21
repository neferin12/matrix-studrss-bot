import dotenv from "dotenv";

dotenv.config();

import Client from "./matrix/Client";
import Feed from "./rss/Feed";

import {Database, JsonDB} from "./db";

const db: Database = new JsonDB();

const feeds: Array<Feed> = [];
const client = new Client(db, ((roomID, url) => {
    const newFeed = new Feed(url, roomID);
    newFeed.startSync(db, client);
    feeds.push(newFeed);
}));

(async () => {
    await client.start();
    console.log("Client started");
    const entries = db.getAllEntries();
    for (const roomID of Object.keys(entries)) {
        feeds.push(new Feed(entries[roomID].url, roomID, new Date(entries[roomID].date)));
    }

    for (const feed of feeds) {
        feed.startSync(db, client);
    }
})();
