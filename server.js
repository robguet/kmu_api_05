const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');


class Server {
    constructor() {
        this.app = express();
        this.port = 8080;

        //conectar db
        this.dbConnection();

        //http server
        this.server = http.createServer(this.app);
    }

    execute() {
        //init server
        this.server.listen(this.port, () => {
            console.log('corriendo servidor');
        });
        // init middlewares
        this.middlewares();
    }

    async dbConnection() {
        const connection = mysql.createConnection({
            host: 'bvzviiphehcohyml5sxm-mysql.services.clever-cloud.com',
            user: 'u6r8rbnbfdqhaluw',
            password: 'UngNk0XXjM7bNggibADG',
            database: 'bvzviiphehcohyml5sxm',
            multipleStatements: true
        });
        connection.connect((err) => {
            if (err) throw err;
            console.log('Connected!');
        });

        // connection.end((err) => {

        // });

        module.exports = {
            connection
        }
    }

    middlewares() {
        // this.app.use(express.static(path.resolve(__dirname, '../public')));

        this.app.use(cors());

        this.app.use(express.json());

        this.app.use('/aut', require('./routes/aut'));

    }
}

module.exports = Server;