var cron = require('node-cron');
const { updateMonthlyCharges } = require('../helper/db-helper');


module.exports = () => {

    cron.schedule('12 * * * * *', () => {
        console.log('running at 12AM');
        updateMonthlyCharges()
    });
}



