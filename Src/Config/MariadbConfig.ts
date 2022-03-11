
/**********************Imports**************** */
import mariadb from "mariadb";

/*******************Initialization********** */
let dbPool : any;

async function initializeDatabase() : Promise<void>
{
    dbPool = await mariadb.createPool({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        database: process.env.DB,
        password: process.env.DBPSS,
        connectionLimit: 5
    });

    console.log("Connected to Mariadb");
}

/**********************Exports**************** */
export {initializeDatabase, dbPool};
