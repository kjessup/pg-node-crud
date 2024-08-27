import { Database } from 'crud';
import pg from 'pg';
pg.types.setTypeParser(20, function (val) {
    return parseInt(val, 10);
});
class PostgresSQLGenDelegate {
    bindings = [];
    getBinding(forExpr) {
        const id = `$${this.bindings.length + 1}`;
        this.bindings.push([id, forExpr]);
        return id;
    }
    quote(identifier) {
        return `"${identifier}"`;
    }
}
class PostgresSQLExeDelegate {
    connection;
    sql;
    constructor(connection, sql) {
        this.connection = connection;
        this.sql = sql;
    }
    async exe(bindings) {
        const exprs = bindings.map(b => (Array.isArray(b) ? b[1] : b).primitiveType());
        const results = await this.connection.pgClient.query(this.sql, exprs);
        return results.rows;
    }
}
export class PostgresConnection {
    pgClient;
    constructor() {
    }
    close() {
        this.pgClient.release();
    }
    async connect() {
        try {
            this.pgClient = await pgPool.connect();
        }
        catch (error) {
            console.log(`PostgresConnection.connect: ${JSON.stringify(error)}`);
            throw error;
        }
        return this;
    }
    sqlGenDelegate() {
        return new PostgresSQLGenDelegate();
    }
    sqlExeDelegate(forSQL) {
        if (process.env.DEBUG_SQL)
            console.info(forSQL);
        return new PostgresSQLExeDelegate(this, forSQL);
    }
}
export const pgPool = new pg.Pool();
export async function postgres() {
    const db = new PostgresConnection();
    const c = await db.connect();
    return new Database(c);
}
//# sourceMappingURL=index.js.map