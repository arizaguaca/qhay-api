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
      // If database doesn't exist (ER_BAD_DB_ERROR), we might want to catch it here
      // but let's keep it simple and handle it in the initialization step.
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
    // 1. Connect without database first
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      multipleStatements: true
    });

    try {
      // 2. Create database if it doesn't exist
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
      await connection.query(`USE \`${config.database}\`;`);

      // 3. Read and execute database.sql
      const sqlPath = path.join(process.cwd(), 'database.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        await connection.query(sql);
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Database schema initialized successfully.');
      }
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