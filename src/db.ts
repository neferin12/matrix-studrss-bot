interface dbItem {
    date?: Date,
    url?: string
}

export interface Database {
    /**
     * Gets all entries from the db
     */
    getEntries(): Record<string, dbItem>;

    /**
     * Sets a lastSynced date for
     * @param roomID The id of the room
     * @param item The date the feed was last synced
     */
    setEntry(roomID: string, item: dbItem): void;

    /**
     * Gets an entry
     * @param roomID The id of the room
     */
    getEntry(roomID: string): dbItem;

    /**
     * deletes an entry
     * @param roomID The id of the room
     */
    deleteEntry(roomID: string): void;
}


import SimplerJsonDB from "simple-json-db";

export class JsonDB implements Database {
    private db;


    constructor() {
        this.db = new SimplerJsonDB("database.json");
    }

    deleteEntry(roomID: string): void {
        this.db.delete(roomID);
    }

    getEntry(roomID: string): dbItem {
        return this.db.get(roomID);
    }

    getEntries(): Record<string, dbItem> {
        return this.db.JSON;
    }

    setEntry(roomID: string, item: dbItem): void {
        this.db.set(roomID, {
            ...this.getEntry(roomID),
            ...item
        });
    }

}
