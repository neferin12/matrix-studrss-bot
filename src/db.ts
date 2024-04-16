import {Column, DataSource, DataSourceOptions, Entity, PrimaryColumn, Repository} from "typeorm";

@Entity()
export class SyncState {
    @PrimaryColumn()
    roomID: string

    @Column({nullable: true})
    date?: Date

    @Column()
    url: string
}

export interface Database {
    /**
     * Initialize database
     */
    init(): Promise<void>;

    /**
     * Gets all entries from the db
     */
    getAllEntries(): Promise<Record<string, SyncState>>;

    /**
     * Sets a lastSynced date for
     * @param roomID The id of the room
     * @param item The date the feed was last synced
     */
    setEntry(roomID: string, item: SyncState): Promise<void>;

    /**
     * Gets an entry
     * @param roomID The id of the room
     */
    getEntry(roomID: string): Promise<SyncState>;

    /**
     * deletes an entry
     * @param roomID The id of the room
     */
    deleteEntry(roomID: string): Promise<void>;
}


import SimplerJsonDB from "simple-json-db";
import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";

export class JsonDB implements Database {
    private db: SimplerJsonDB<SyncState>;


    constructor() {
        this.db = new SimplerJsonDB("database.json");
    }

    async init(): Promise<void> {
        return;
    }

    async deleteEntry(roomID: string): Promise<void> {
        this.db.delete(roomID);
    }

    async getEntry(roomID: string): Promise<SyncState> {
        return this.db.get(roomID);
    }

    async getAllEntries(): Promise<Record<string, SyncState>> {
        return this.db.JSON();
    }

    async setEntry(roomID: string, item: SyncState): Promise<void> {
        this.db.set(roomID, {
            ...(await this.getEntry(roomID)),
            ...item
        });
    }
}

export class PostgresDB implements Database {
    private readonly AppDataSource: DataSource;
    private repository: Repository<SyncState>;
    constructor(config: Pick<PostgresConnectionOptions, "host" | "port" | "username" | "password" | "database">) {
        this.AppDataSource = new DataSource({
            type: "postgres",
            synchronize: true,
            logging: false,
            entities: [SyncState],
            ...config
        });
    }
    async init(): Promise<void> {
        await this.AppDataSource.initialize();
        this.repository = this.AppDataSource.getRepository(SyncState);
    }


    async deleteEntry(roomID: string): Promise<void> {
        await this.repository.delete(await this.getEntry(roomID));
    }

    async getAllEntries(): Promise<Record<string, SyncState>> {
        const allEntries = await this.repository.find();
        const result = {};
        for (const entry of allEntries) {
            result[entry.roomID] = entry;
        }
        return result;
    }

    async getEntry(roomID: string): Promise<SyncState> {
        return await this.repository.findOneBy({roomID})
    }



    async setEntry(roomID: string, item: SyncState): Promise<void> {
        await this.repository.save(item)
    }
}
