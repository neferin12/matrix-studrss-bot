import {
    MatrixClient,
    SimpleFsStorageProvider,
    RichReply, AutojoinRoomsMixin
} from "matrix-bot-sdk";

import {Database} from "../db";

class Client {
    private readonly client: MatrixClient;
    private readonly db: Database;

    constructor(db: Database, newFeed:(roomID:string, url:string) => void) {
        this.db = db;

        const storage = new SimpleFsStorageProvider("bot.json");
        const {ACCESS_TOKEN, HOMESERVER_URL} = process.env;
        this.client = new MatrixClient(HOMESERVER_URL, ACCESS_TOKEN, storage);
        AutojoinRoomsMixin.setupOnClient(this.client);

        this.client.on("room.message", (roomId, event) => {
            if (!event["content"] || event["content"]["msgtype"] !== "m.text") return;
            const sender = event["sender"];
            const body = event["content"]["body"];

            if (body.startsWith("!status")) {
                this.client.sendNotice(roomId, "Studon URL is " + this.db.getEntry(roomId)?.url);
            } else if (body.startsWith("!set")) {
                const url = body.split(" ")[1];
                this.db.setEntry(roomId, {url});
                newFeed(roomId, url);
                this.client.sendNotice(roomId, "Studon URL was set");
            } else if (body.startsWith("!reset")) {
                this.db.deleteEntry(roomId);
                this.client.sendNotice(roomId, "Data was reseted");
            }

        });
    }

    start(): Promise<void> {
        return this.client.start();
    }

    sendHTMLMessage(message: string, roomID: string): Promise<string> {
        return this.client.sendHtmlNotice(roomID, message);
    }

}

export default Client;
