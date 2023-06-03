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

        this.client.on("room.message", async (roomId, event) => {
            if (!event["content"] || event["content"]["msgtype"] !== "m.text") return;

            const sender = event["sender"];
            if (sender === await this.client.getUserId()) return;

            const o_body = event["content"]["body"];
            const body = o_body.toLowerCase().trim();

            switch (body) {
                case "status":
                    await this.client.sendText(roomId, "Studon URL is " + this.db.getEntry(roomId)?.url);
                    break;
                case "reset":
                    this.db.deleteEntry(roomId);
                    await this.client.sendText(roomId, "Data was reseted");
                    break;
                case "help":
                    await this.sendHTMLMessage(helpHTML, roomId);
                    break;
                default:
                    if (body.startsWith("set") && !!body.split(" ")[1]) {
                        const url = body.split(" ")[1];
                        this.db.setEntry(roomId, {url});
                        newFeed(roomId, url);
                        await this.client.sendText(roomId, "Studon URL was sucessfully set to " + url);
                    } else {
                        await this.sendHTMLMessage("<b>Unknown command \"" + o_body + "\"</b><br><p>Type <code>help</code> to get help.</p>", roomId);
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
