import dotenv from "dotenv";
dotenv.config();

import Client from "./matrix/Client";
import Feed from "./rss/Feed";

import {Database, JsonDB} from "./db";
const db: Database = new JsonDB();

const feeds: Array<Feed> = [];
const client = new Client(db);

(async () => {
    await client.start();
    console.log("Client started");
    const entries = db.getAllEntries();
    for (const roomID of Object.keys(entries)) {
        console.log(roomID);
        feeds.push(new Feed(entries[roomID].url, roomID, entries[roomID].date));
    }

    for (const feed of feeds) {
        feed.getFeed(db);
    }
})();
