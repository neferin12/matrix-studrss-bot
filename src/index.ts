import "reflect-metadata"
import dotenv from "dotenv";

dotenv.config();

import Client from "./matrix/Client";
import Feed from "./rss/Feed";

import {Database, JsonDB, PostgresDB} from "./db";

let db: Database;

if (process.env.DATABASE_TYPE === "postgres") {
    console.info("Using Postgres DB");
    db = new PostgresDB({
        host: process.env.POSTGRES_HOST,
        port: Number.parseInt(process.env.POSTGRES_PORT) || undefined,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASS,
        database: process.env.POSTGRES_DB
    })
} else {
    console.info("Using JSON DB");
    db = new JsonDB();
}


const feeds: Array<Feed> = [];
const client = new Client(db, ((roomID, url) => {
    const newFeed = new Feed(url, roomID);
    newFeed.startSync(db, client);
    feeds.push(newFeed);
}));

(async () => {
    await db.init();
    console.info("DB initialized");
    await client.start();
    console.info("Client started");
    const entries = db.getAllEntries();
    for (const roomID of Object.keys(entries)) {
        feeds.push(new Feed(entries[roomID].url, roomID, new Date(entries[roomID].date)));
    }

    for (const feed of feeds) {
        feed.startSync(db, client);
    }
})();
