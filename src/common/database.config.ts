import { IInitOptions, IDatabase } from 'pg-promise';
import * as pgPromise from 'pg-promise';

const initOptions: IInitOptions = {
  // Configura las opciones de conexión aquí
};

const pgp = pgPromise(initOptions);

const db: IDatabase<{}> = pgp({
  user: 'postgres',
  password: 'mysecretpassword',
  host: 'localhost',
  port: 5432, 
  database: 'UserCode',
});

export default db;