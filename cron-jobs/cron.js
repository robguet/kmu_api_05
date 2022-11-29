var cron = require('node-cron');
const { updatemonthlyCharges } = require('../helper/db-helper');


module.exports = () => {

    cron.schedule('0 0 0 * * *', () => {
        console.log('running at 12AM');
        updatemonthlyCharges()
    });
}



