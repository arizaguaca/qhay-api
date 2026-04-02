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
    this.connection = await mysql.createConnection(config);
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