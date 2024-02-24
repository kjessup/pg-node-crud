import { SQLGenDelegate, ExpressionBinding, Expression, SQLExeDelegate, IDatabaseConnection, Database } from 'crud';
import pg from 'pg';

pg.types.setTypeParser(20, function (val) {
    return parseInt(val, 10)
})

class PostgresSQLGenDelegate implements SQLGenDelegate {
    bindings: ExpressionBinding[] = [];
    getBinding(forExpr: Expression): string {
        const id = `$${this.bindings.length + 1}`;
        this.bindings.push([id, forExpr]);
        return id;
    }
    quote(identifier: string): string {
        return `"${identifier}"`;
    }
}

class PostgresSQLExeDelegate implements SQLExeDelegate {
    constructor(public connection: PostgresConnection, public sql: string) { }
    async exe<Shape extends Object>(bindings: ExpressionBinding[]): Promise<Shape[]> {
        const exprs = bindings.map(b => (b[1] as any).primitiveType());
        const results = await this.connection.pgClient.query<Shape>(this.sql, exprs);
        return results.rows;
    }
}

export class PostgresConnection implements IDatabaseConnection {
    pgClient!: pg.PoolClient;

    constructor() {

    }
    close(): void {
        this.pgClient.release();
    }

    async connect(): Promise<this> {
        try {
            this.pgClient = await pgPool.connect();
        } catch (error) {
            console.log(`PostgresConnection.connect: ${JSON.stringify(error)}`);
            throw error;
        }
        return this;
    }

    sqlGenDelegate(): SQLGenDelegate {
        return new PostgresSQLGenDelegate();
    }

    sqlExeDelegate(forSQL: string): SQLExeDelegate {
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