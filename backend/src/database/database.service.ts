import { Injectable } from "@nestjs/common";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import * as relations from "./relations";

type Schema = typeof schema & typeof relations;

/**
 * Lazy Drizzle + MySQL connection.
 *
 * The pool is created on first `.db` access, NOT at bootstrap, so the app can
 * start (and serve public routes like /api/health) with no database. Any route
 * that touches the DB throws a clear error until DATABASE_URL is configured.
 */
@Injectable()
export class DatabaseService {
  private _db: MySql2Database<Schema> | undefined;

  get db(): MySql2Database<Schema> {
    if (!this._db) {
      const url = process.env.DATABASE_URL;
      if (!url) {
        throw new Error(
          "DATABASE_URL is not set — configure it in backend/.env to use database features.",
        );
      }
      const pool = mysql.createPool(url);
      this._db = drizzle(pool, {
        schema: { ...schema, ...relations },
        mode: "default",
      });
    }
    return this._db;
  }
}
