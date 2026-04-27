import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

export class MySQLConnection {
  private connection: mysql.Connection | null = null;

  async connect(config: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  }): Promise<void> {
    try {
      this.connection = await mysql.createConnection(config);
    } catch (error: any) {
      throw error;
    }
  }

  async initializeDatabase(config: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  }): Promise<void> {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      multipleStatements: true,
    });

    try {
      // 1. Create database if it doesn't exist
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
      await connection.query(`USE \`${config.database}\`;`);

      // 2. Read database.sql
      const sqlPath = path.join(process.cwd(), 'database.sql');
      if (!fs.existsSync(sqlPath)) {
        console.log('No database.sql found, skipping schema initialization.');
        return;
      }

      const sql = fs.readFileSync(sqlPath, 'utf8');

      // 3. Split into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

      for (const stmt of statements) {
        const upper = stmt.toUpperCase();

        // CREATE TABLE IF NOT EXISTS are idempotent — always safe to run
        if (upper.startsWith('CREATE TABLE')) {
          await connection.query(stmt + ';');
          continue;
        }

        // ALTER TABLE ADD CONSTRAINT — skip if constraint already exists
        if (upper.startsWith('ALTER TABLE') && upper.includes('ADD CONSTRAINT')) {
          const constraintMatch = stmt.match(/ADD\s+CONSTRAINT\s+(\w+)/i);
          if (constraintMatch) {
            const constraintName = constraintMatch[1];
            const [rows] = await connection.query(
              `SELECT COUNT(*) as cnt FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = ? AND CONSTRAINT_NAME = ?`,
              [config.database, constraintName]
            );
            if ((rows as any[])[0].cnt > 0) {
              // Constraint already exists, skip
              continue;
            }
          }
          await connection.query(stmt + ';');
          continue;
        }

        // Any other statement (INSERT, etc.) — just run it
        await connection.query(stmt + ';');
      }

      await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('Database schema initialized successfully.');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  getConnection(): mysql.Connection {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    return this.connection;
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
    }
  }
}