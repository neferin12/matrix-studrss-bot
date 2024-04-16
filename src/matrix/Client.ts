import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin
} from "matrix-bot-sdk";
import {version} from "../../package.json"
import {Database} from "../db";

const helpHTML = "<h3>StudOnRSS Matrix Bot (v"+version+")</h3>\n" +
    "Available commands are:\n" +
    "<ul>\n" +
    "    <li><code>help</code>: Shows this help dialog</li>\n" +
    "    <li><code>status</code>: Gives information about the current status</li>\n" +
    "    <li><code>set URL_OF_STUDON_RSS_FEED</code>: Sets the URL and activates bridging</li>\n" +
    "    <li><code>reset</code>: Deletes the URL and deactivates bridging</li>\n" +
    "</ul>"

class Client {
    private readonly client: MatrixClient;
    private readonly db: Database;

    constructor(db: Database, newFeed: (roomID: string, url: string) => void) {
        this.db = db;

        const storage = new SimpleFsStorageProvider("bot.json");
        const {ACCESS_TOKEN, HOMESERVER_URL} = process.env;
        if(!ACCESS_TOKEN) throw new Error("No access token provided");
        if(!HOMESERVER_URL) throw new Error("No homeserver URL provided");
        this.client = new MatrixClient(HOMESERVER_URL, ACCESS_TOKEN, storage);
        AutojoinRoomsMixin.setupOnClient(this.client);

        this.client.on("room.message", async (roomID, event) => {
            if (!event["content"] || event["content"]["msgtype"] !== "m.text") return;

            const sender = event["sender"];
            if (sender === await this.client.getUserId()) return;

            const o_body = event["content"]["body"];
            const body = o_body.toLowerCase().trim();

            switch (body) {
                case "status":
                    await this.client.sendText(roomID, "StudOn URL is " + (await this.db.getEntry(roomID))?.url);
                    break;
                case "reset":
                    await this.db.deleteEntry(roomID);
                    await this.client.sendText(roomID, "Data was reset");
                    break;
                case "help":
                    await this.sendHTMLMessage(helpHTML, roomID);
                    break;
                default:
                    if (body.startsWith("set") && !!body.split(" ")[1]) {
                        const url = body.split(" ")[1];
                        await this.db.setEntry(roomID, {roomID, url});
                        newFeed(roomID, url);
                        await this.client.sendText(roomID, "StudOn URL was successfully set to " + url);
                    } else {
                        await this.sendHTMLMessage("<b>Unknown command \"" + o_body + "\"</b><br><p>Type <code>help</code> to get help.</p>", roomID);
                    }
            }

        });
    }

    start(): Promise<void> {
        return this.client.start();
    }

    sendHTMLMessage(message: string, roomID: string): Promise<string> {
        return this.client.sendHtmlText(roomID, message);
    }

}

export default Client;
