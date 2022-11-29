const { connection } = require("../config/db");
const moment = require("moment");

const createCharge = async (req, res) => {
  const { idCard, date, money, title, idUser, FK_idCategory, isMonthly } =
    req.body;
  const d = new Date(date).getTime();
  const formatDate = moment(d).format("YYYY-MM-DD");
  const dateTime = new Date(date).toISOString().slice(0, 19).replace("T", " ");
  const stmt2 = `SELECT idCard, pendingBalance FROM Users_Cards WHERE fk_idCard = ? AND FK_idUser = ?`;

  let FK_idCharges;
  connection.query(stmt2, [idCard, idUser], async (error, results1) => {
    if (error) {
      return res.status(500).json({ error });
    }
    const newBalance = results1[0].pendingBalance + money;
    FK_idCharges = results1[0].idCard;
    //?UPDATE CREDIT CARD BALANCE
    const qUpdateCreditCardBalance = `UPDATE Users_Cards SET pendingBalance= ? WHERE FK_idUser = ? AND fk_idCard=?`;
    connection.query(
      qUpdateCreditCardBalance,
      [newBalance, idUser, idCard],
      async (error) => {
        if (error) {
          return res.status(500).json({ error });
        }
        const chargeInfo = [
          [idCard, formatDate, money, title, idUser, FK_idCategory, dateTime],
        ];
        //?CREATE CREATE CHARGE
        const qCreateCharge = `INSERT INTO Charges(idCard, date, money, title, FK_idUser, FK_idCategory, dateCharge)  VALUES ?  `;
        connection.query(
          qCreateCharge,
          [chargeInfo],
          async (error, results) => {
            if (error) {
              return res.status(500).json({ error });
            }

            if (isMonthly) {
              FK_idCharges = results.insertId;
              const monthlyCharges = [
                [FK_idCharges, results1[0].idCard, idCard, 0],
              ];
              //?CREATE IF CHARGE IS MONTHLY
              const qCreateMonthlyCharge = `INSERT INTO Monthly_Charges(FK_idCharges, FK_idUsers_Cards, FK_idCard, paid)  VALUES ?  `;
              connection.query(
                qCreateMonthlyCharge,
                [monthlyCharges],
                async (error) => {
                  if (error) {
                    return res.status(500).json({ error });
                  }
                }
              );
            }
            res.status(200).json({ formatDate });
          }
        );
      }
    );
  });
};

const getChargeByUser = async (req, res) => {
  const { id } = req.params;

  const arr = req.body.map((body) => {
    return [body.card, body.startDate, body.endDate];
  });
  const merged = [].concat.apply([], arr);

  const sql = `SELECT date, money, title, Cards.label as method, Cards.value, Categories.color, Categories.label, icon FROM Charges 
    left JOIN Users ON Charges.FK_idUser = Users.idUser 
    left JOIN Cards ON Charges.idCard = Cards.idCard
    left JOIN Categories ON Charges.FK_idCategory = Categories.idCategory
    Where (Charges.FK_idUser = ${id} AND
	Cards.value = ?)
    AND date BETWEEN ? AND ?
    ORDER BY date DESC;`;
  let string = "";
  for (var i = 0; i < arr.length; i++) {
    string += sql;
  }
  connection.query(string, merged, function (err, result) {
    if (err) {
      console.log(err);
      return res.status(500).json({ err });
    }

    const chargesMerged = [].concat.apply([], result); //merge arrays with results
    chargesMerged.sort((a, b) => {
      //sort by date merged arrays
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    res.status(200).json(chargesMerged);
  });
};

const getChargesByCategory = async (req, res) => {
  const { id, category } = req.params;

  const arr = req.body.map((body) => {
    return [body.card, body.startDate, body.endDate];
  });
  const merged = [].concat.apply([], arr);

  const sql = `SELECT date, money, title, Cards.label as method, Cards.value, Categories.color, Categories.label, icon FROM Charges 
    left JOIN Users ON Charges.FK_idUser = Users.idUser 
    left JOIN Cards ON Charges.idCard = Cards.idCard
    left JOIN Categories ON Charges.FK_idCategory = Categories.idCategory
    Where (Charges.FK_idUser = ${id} AND
	Cards.value = ? AND FK_idCategory = '${category}')
    AND date BETWEEN ? AND ?
    ORDER BY date DESC;`;

  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += sql;
  }
  connection.query(str, merged, function (err, result) {
    if (err) {
      return res.status(500).json({ err });
    }
    const chargesByCategory = [].concat.apply([], result);
    res.status(200).json(chargesByCategory);
  });
};

const getChargesByPaymentMethod = async (req, res) => {
  const { id, method } = req.params;
  const { startDate, endDate } = req.body;

  //? QUERY GET CHARGES BY PAYMENT METHOD
  const sql = `SELECT date, money, title, Cards.label as method, Cards.value, Categories.color, Categories.label, icon FROM Charges 
    left JOIN Users ON Charges.FK_idUser = Users.idUser 
    left JOIN Cards ON Charges.idCard = Cards.idCard
    left JOIN Categories ON Charges.FK_idCategory = Categories.idCategory
    Where (Charges.FK_idUser = ? AND Charges.idCard = ?)
    AND date BETWEEN ? AND ?
    ORDER BY date DESC;`;
  connection.query(
    sql,
    [id, method, startDate, endDate],
    function (err, result) {
      if (err) {
        return res.status(500).json({ err });
      }
      res.status(200).json(result);
    }
  );
};

const getListCharges = (req, res) => {
  //?QUERY TO GET ALL CATEGORIES
  const qGetAllCategories = "SELECT * FROM Categories";
  connection.query(qGetAllCategories, function (err, result) {
    if (err) {
      return res.status(500).json({ err });
    }
    res.status(200).json(result);
  });
};

const payCreditCard = (req, res) => {
  const { idCard, amount } = req.body;
  //?QUERY TO PAY THE CREDIT CARD
  const qPayCreditCard = `UPDATE Users_Cards SET pendingBalance = ? WHERE idCard = ?`;
  connection.query(qPayCreditCard, [amount, idCard], async (err) => {
    if (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
    res.status(200).json({ ok: true });
  });
};

module.exports = {
  createCharge,
  getChargeByUser,
  getChargesByCategory,
  getListCharges,
  payCreditCard,
  getChargesByPaymentMethod,
};
