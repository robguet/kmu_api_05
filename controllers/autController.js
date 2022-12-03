const { generarJWT } = require("../helper/jwt");
const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");
// const { client } = require("../helper/whats");

const query = async (req, res) => {
  res.status(200).json({ ok: true });
};

const signUp = async (req, res) => {
  const { name, budget, cutDate, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  //?VALIDATE UNIQUE USER
  const qValidateUniqueUser = "SELECT * FROM Users WHERE email = ?";
  connection.query(qValidateUniqueUser, [email], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    if (result[0]) {
      return res.json({ ok: false, message: "Email registrado" });
    }

    //?INSERT USER INTO THE DB
    const qInsertUser = `INSERT INTO Users(name, budget, cutDate, email, password)  VALUES ?  `;
    const user = [[name, budget, cutDate, email, hash]];
    connection.query(qInsertUser, [user], async (err, results) => {
      if (err) {
        return console.error(err.message);
      }

      //?CREATE BILLING USER
      const qInsertBillingUser = `INSERT INTO Users_Cards SET ?`;
      connection.query(
        qInsertBillingUser,
        { FK_idUser: results.insertId, fk_idCard: "3", cutoffDate: "1" },
        async (err) => {
          if (err) {
            return console.error(err.message);
          }
          const token = await generarJWT(results.insertId);
          res.json({ ok: true, token });
        }
      );
    });
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  //?QUERY FIND USER
  const qSelectUser = "SELECT * FROM Users WHERE email = ?";
  connection.query(qSelectUser, [email], async function (err, result) {
    if (err) {
      console.log(err);
      return res.status(500).json({ err });
    }
    const user = result[0];

    if (result.length < 1) {
      return res
        .status(500)
        .json({ ok: false, message: "No se encontró ningun usuario" });
    }
    const validarPassword = bcrypt.compareSync(password, user.password);

    if (!validarPassword) {
      return res
        .status(500)
        .json({ ok: false, validarPassword, message: "Constraseña no valida" });
    }

    const token = await generarJWT(result[0].idUser);
    res.status(200).json({ validarPassword, ok: true, token });
  });
};

const newToken = async (req, res) => {
  try {
    const uid = req.uid;
    const token = await generarJWT(uid);

    //?QUERY GET USER INFORMATION AND BILLING INFORMATION
    var qAllUserInfo =
      "SELECT idUser, name, email, budget, investmentLimit, label, value, fk_idCard, cutoffDate, Users_Cards.idCard, pendingBalance FROM Users_Cards INNER JOIN Users on Users_Cards.FK_idUser = Users.idUser INNER JOIN Cards on Users_Cards.fk_idCard = Cards.idCard Where Users_Cards.FK_idUser = ? AND Users_Cards.isActive = 1";
    connection.query(qAllUserInfo, [uid], async function (error, result) {
      if (error) {
        return res.status(500).json({ error });
      }
      if (result.length < 1) {
        return res.status(500).json({
          ok: false,
          message: "No se encontro ningun usuario",
          result: result.length,
        });
      }

      [userInfor] = result;
      const { idUser, name, email, cutDate, budget, investmentLimit } =
        userInfor;
      const user = {
        idUser,
        name,
        email,
        cutDate,
        budget,
        investmentLimit,
      };

      const cards = result.map((data) => {
        return {
          idCard: data.idCard,
          value: data.value,
          label: data.label,
          fk_idCard: data.fk_idCard,
          cutoffDate: data.cutoffDate,
          pendingBalance: data.pendingBalance,
        };
      });

      user.cards = cards;
      //?QUERY GET USER CARDS
      const qGetCards = `SELECT * FROM Users_Cards WHERE FK_idUser = 1 AND isActive = 1`;
      connection.query(qGetCards, async (err) => {
        if (err) {
          return console.error(err.message);
        }
        res.status(200).json({ ok: true, token, user });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
};

const updateProfile = (req, res) => {
  const { name, email, budget, investmentLimit, cards } = req.body;
  const { id } = req.params;
  //?UPDATE THE MAIN PROFILE
  const qUpdateProfile =
    "UPDATE Users SET name = ?, email = ?, budget = ?, investmentLimit = ? WHERE idUser = ?";
  connection.query(
    qUpdateProfile,
    [name, email, budget, investmentLimit, id],
    async (err) => {
      if (err) {
        return res.status(500).json({ ok: false, error: err.message });
      }
      res.status(200).json({ ok: true });
    }
  );

  //?ADD OR REMOVE CARDS

  //?SELECT Users_Cards IN ORDER TO UPDATE
  const stmtSelect = `SELECT * FROM Users_Cards WHERE FK_idUser = ${id} AND isActive = 1`;
  let cardsToAdd = [];
  connection.query(stmtSelect, async (err, sqlres) => {
    if (err) {
      return sqlres.status(500).json({ ok: false, error: err.message });
    }
    const newCardsToAdd = cards.filter((card, idx) => {
      if (card.fk_idCard !== sqlres[idx]?.fk_idCard) {
        return card;
      }
    });

    let cardsToRemove = sqlres.filter((object1) => {
      return !cards.some((object2) => {
        return object1.idCard === object2.idCard;
      });
    });

    cardsToAdd = newCardsToAdd.map((card) => {
      return [id, card.fk_idCard, 15, 0, 1];
    });

    //? STATEMENT TO REMOVE CARDS
    if (cardsToRemove.length > 0) {
      cardsToRemove = cardsToRemove.map((card) => {
        //?DELETE CARDS THAT ARE NOT CREDIT CARDS
        const stmtUpdateRemove = `UPDATE Users_Cards SET isActive = 0 WHERE idCard = ${card.idCard} `;
        connection.query(stmtUpdateRemove, async (err) => {
          if (err) {
            console.log(err);
            return;
          }
        });
      });
    }

    //? STATEMENT TO ADD CARDS
    if (cardsToAdd.length > 0) {
      cardsToAdd.map((card) => {
        //?VERIFY THAT EXISTS THE CARD IN THE DB
        const stmtExistsCard = `SELECT * FROM Users_Cards WHERE FK_idUser = ${id} AND fk_idCard = ${card[1]}`;
        connection.query(stmtExistsCard, async (err, card) => {
          if (err) {
            console.log(err);
            return;
          }
          //? IF EXISTS THE CARD WILL ACTIVATE IT
          if (card.length > 0) {
            const stmtUpdate = `UPDATE Users_Cards SET isActive = 1 WHERE idCard = ${card[0].idCard}`;
            connection.query(stmtUpdate, (err, result) => {
              if (err) {
                console.log(err);
                return;
              }
            });
          }
          //? IF NOT EXISTS THE CARD WILL BE CREATED
          else {
            console.log(cardsToAdd);
            const stmtInsert = `INSERT INTO Users_Cards(FK_idUser, fk_idCard, cutoffDate, pendingBalance, isActive) VALUES ?`;
            connection.query(stmtInsert, [cardsToAdd], (err, result) => {
              if (err) {
                console.log(err);
                return;
              }
            });
          }
        });
      });
    }
  });
};

const updateCutOffDate = (req, res) => {
  const cutOffDateCardsArray = req.body;
  const cutOffDateCards = [].concat.apply([], cutOffDateCardsArray);
  let qUpdateCutoffdates = "";
  var sql =
    "UPDATE Users_Cards SET cutoffDate=? WHERE FK_idUser = ? AND fk_idCard=?;";
  for (var i = 0; i < cutOffDateCardsArray.length; i++) {
    qUpdateCutoffdates += sql;
  }
  console.log(qUpdateCutoffdates);
  //?UPDATE CUTOFFDATE
  connection.query(qUpdateCutoffdates, cutOffDateCards, function (err, rows) {
    if (err) {
      return res.status(500).json({ ok: false, err: err.message });
    }
    res.status(200).json({ ok: true, rows });
  });
};

const whatsapp = async (req, res) => {
  // await client.sendMessage("5213314611993@c.us", "desde ruta");
  res.send(true);
};

module.exports = {
  query,
  signIn,
  signUp,
  newToken,
  updateProfile,
  updateCutOffDate,
  whatsapp,
};
