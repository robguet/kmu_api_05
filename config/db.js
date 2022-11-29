const mysql = require('mysql2');


const dbConnection = async () => {
    // const connection = mysql.createConnection({
    //     host: 'bvzviiphehcohyml5sxm-mysql.services.clever-cloud.com',
    //     user: 'u6r8rbnbfdqhaluw',
    //     password: 'UngNk0XXjM7bNggibADG',
    //     database: 'bvzviiphehcohyml5sxm',
    //     multipleStatements: true
    // });
    const connection = mysql.createConnection({
        host: 'bvzviiphehcohyml5sxm-mysql.services.clever-cloud.com',
        user: 'u6r8rbnbfdqhaluw',
        password: 'UngNk0XXjM7bNggibADG',
        database: 'bvzviiphehcohyml5sxm',
    });
    connection.connect((err) => {
        if (err) throw err;
        console.log('Connected!');
    });

    module.exports = { connection }

}

module.exports = { dbConnection }
