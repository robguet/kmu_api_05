var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "bvzviiphehcohyml5sxm-mysql.services.clever-cloud.com",
  user: "u6r8rbnbfdqhaluw",
  password: "UngNk0XXjM7bNggibADG",
  database: "bvzviiphehcohyml5sxm",
  multipleStatements: true,
});

const updateMonthlyCharges = () => {
  let sql2 = `SELECT idMonthly_Charges, Charges.FK_idUser, Charges.idCharge, cutoffDate, pendingBalance, date, money, paid, value, Cards.idCard  
        FROM Monthly_Charges 
        INNER JOIN Users_Cards ON Users_Cards.idCard = Monthly_Charges.FK_idUsers_Cards 
        INNER JOIN Charges ON Charges.idCharge = Monthly_Charges.FK_idCharges
        INNER JOIN Cards ON Cards.idCard = Users_Cards.fk_idCard
        WHERE paid = 0
        ORDER BY FK_idUser, idCard ASC
        `;
  connection.query(sql2, function (error, res) {
    if (error) throw error;
    res.map((item) => {
      let start = new Date();
      let end = new Date();
      start.setDate(item.cutoffDate);
      end.setDate(item.cutoffDate);
      end.setMonth(end.getMonth() + 1);

      //   if (new Date(item.date).getDate() >= 10) {
      //     // console.log(new Date(item.date).getDate());
      //     start.setMonth(end.getMonth() - 2);
      //     end.setMonth(end.getMonth() - 1);
      //   }
      // console.log(item);
      // console.log(start);
      // console.log(end);
      if (
        new Date(item.date) > start &&
        new Date(item.date) < end &&
        !item.paid
      ) {
        let sql4 = `START TRANSACTION;
                UPDATE Users_Cards
                SET Users_Cards.pendingBalance = Users_Cards.pendingBalance + ${item.money}
                WHERE Users_Cards.FK_idUser = ${item.FK_idUser} AND Users_Cards.fk_idCard = ${item.idCard};
                UPDATE Monthly_Charges
                SET Monthly_Charges.paid = 1
                WHERE Monthly_Charges.idMonthly_Charges = ${item.idMonthly_Charges};
                COMMIT;`;
        connection.query(sql4, function (error) {
          if (error) throw error;
        });
      }
    });
  });
};

module.exports = {
  updateMonthlyCharges,
};
