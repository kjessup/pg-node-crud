import { SQLGenDelegate, SQLExeDelegate, IDatabaseConnection, Database } from 'crud';
import pg from 'pg';
export declare class PostgresConnection implements IDatabaseConnection {
    pgClient: pg.PoolClient;
    constructor();
    close(): void;
    connect(): Promise<this>;
    sqlGenDelegate(): SQLGenDelegate;
    sqlExeDelegate(forSQL: string): SQLExeDelegate;
}
export declare const pgPool: pg.Pool;
export declare function postgres(): Promise<Database>;
