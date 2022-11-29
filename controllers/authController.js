const { generateJWT } = require('../helpers/jwt');
const { connection } = require('../config/db');
const bcrypt = require('bcryptjs');

const query = async (req, res) => {

    connection.query('SELECT * FROM Users', (err, rows) => {
        if (err) {
            throw err;
        }
        console.log(rows)
        res.json({ rows })

    });


}

const signUp = async (req, res) => {
    try {
        const { name, budget, cutDate, email, password } = req.body;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const stmt = `INSERT INTO Users(name, budget, cutDate, email, password)  VALUES ?  `;
        const values = [
            [name, budget, cutDate, email, hash],
        ];

        const promisePool = connection.promise();
        const [rows, fields] = await promisePool.query(stmt, [values]);
        const stmt2 = `INSERT INTO Users_Cards(FK_idUser, fk_idCard)  VALUES ('${rows.insertId}', '3')  `;

        await promisePool.query(stmt2);
        const token = await generateJWT(rows.insertId);
        res.json({ ok: true, token })
    } catch (error) {

    }
}

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adr = email;
        const sql = 'SELECT * FROM Users WHERE email = ?';
        const promisePool = connection.promise();

        const [rows, fields] = await promisePool.query(sql, [adr]);

        const validarPassword = bcrypt.compareSync(password, '$2a$10$hvwLPgpyAE5PaeSeEyURjOA2uESOureqFwr.B29wkQjJ1WZnsLGMi'); // true

        if (rows.length < 1) {
            return res.json({ ok: false, message: "No se encontro ningun usuario", res: result.length })
        }

        if (!validarPassword) { return res.json({ ok: false, res }) }

        const token = await generateJWT(rows[0].idUser);
        res.json({ ok: true, token })


    } catch (error) {
        console.log(error)
    }
}

const newToken = async (req, res) => {
    try {
        const uid = req.uid;
        const token = await generateJWT(uid);
        const adr = uid;
        const sql = 'SELECT idUser, name, email, budget, cutDate, label, value, fk_idCard FROM Users_Cards INNER JOIN Users on Users_Cards.FK_idUser = Users.idUser INNER JOIN Cards on Users_Cards.fk_idCard = Cards.idCard Where Users_Cards.FK_idUser = ?';

        const promisePool = connection.promise();

        const [rows, fields] = await promisePool.query(sql, [adr]);
        if (rows.length < 1) {
            return res.json({ ok: false, message: "No se encontro ningun usuario", result: rows.length })
        }

        [userInfor] = rows
        const { idUser, name, email, cutDate, budget } = userInfor
        const user = {
            idUser, name, email, cutDate, budget
        }


        const cards = rows.map(data => {
            return {
                value: data.value,
                label: data.label,
                fk_idCard: data.fk_idCard
            }
        })

        res.json({ ok: true, token, user, cards });
    } catch (error) {
        res.json({ error: true })
    }
}


module.exports = {
    query,
    signUp,
    signIn,
    newToken
};
