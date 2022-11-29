const mysql = require('mysql');

const dbConnection = async () => {
    const connection = mysql.createConnection({
        host: 'bvzviiphehcohyml5sxm-mysql.services.clever-cloud.com',
        user: 'u6r8rbnbfdqhaluw',
        password: 'UngNk0XXjM7bNggibADG',
        database: 'bvzviiphehcohyml5sxm',
        multipleStatements: true
    });
    connection.connect((err) => {
        if (err) {
            console.log('err')
            console.log(err)
            dbConnection()
            // throw err;
        }
        console.log('Connected!');
    });

    module.exports = { connection }

}

module.exports = { dbConnection }
