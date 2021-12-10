import {Connection, ConnectionOptions, createConnection} from "typeorm"
import {Event} from "./entity/event";


const options: ConnectionOptions = {
    type: "sqlite",
    database: "./db/db.sqlite3",
    entities: [Event],
    synchronize: false,
};

let connection: Connection | null = null

export async function getDB(): Promise<Connection> {
    if (!connection) {
        connection = await createConnection(options)
        await connection.query("PRAGMA foreign_keys=OFF");
        await connection.synchronize();
        await connection.query("PRAGMA foreign_keys=ON");
    }
    return connection
}