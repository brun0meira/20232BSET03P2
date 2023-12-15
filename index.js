const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
// Observação: Mudei a porta pois a minha porta 3000 está em uso por algum processo interno do Node
const port = 3003;

app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

// Função para sanitizar e validar entrada
const sanitizeInput = (input) => {
  // Verifica se é string e também usar a função trim() para formatar (Exemplo: tirar possiveis espaços em brancos)
  if (typeof input !== 'string' || input.trim() === '') {
    throw new Error('Invalid input');
  }

  return input.trim();
};

// Para não retornar o erro para o usuario usamos essa função
const handleDatabaseError = (res, operation) => (err) => {
  console.error(`Error during ${operation}:`, err);
  res.status(500).send(`Erro ao ${operation}`);
};

db.serialize(() => {
  db.run("CREATE TABLE cats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, votes INT)");
  db.run("CREATE TABLE dogs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, votes INT)");
});

app.post('/cats', (req, res) => {
  try {
    const name = sanitizeInput(req.body.name);
    db.run("INSERT INTO cats (name, votes) VALUES (?, 0)", [name], function (err) {
      if (err) {
        console.log('error running create cats:', err);
        handleDatabaseError(res, "inserir gato no banco de dados")(err);
      } else {
        res.status(201).json({ id: this.lastID, name, votes: 0 });
      }
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/dogs', (req, res) => {
  try {
    const name = sanitizeInput(req.body.name);
    db.run("INSERT INTO dogs (name, votes) VALUES (?, 0)", [name], function (err) {
      if (err) {
        console.log('error running create dogs:', err);
        handleDatabaseError(res, "inserir cachorro no banco de dados")(err);
      } else {
        res.status(201).json({ id: this.lastID, name, votes: 0 });
      }
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/vote/:animalType/:id', (req, res) => {
  try {
    const animalType = sanitizeInput(req.params.animalType);
    const id = parseInt(req.params.id);

    // Valida o animalType para evitar possível injeção de SQL
    if (animalType !== 'cats' && animalType !== 'dogs') {
      throw new Error('Invalid animalType');
    }

    // Valida o ID para evitar possível injeção de SQL
    if (isNaN(id) || id <= 0) {
      throw new Error('Invalid id');
    }

    // Verifica se o registro existe
    const tableName = animalType === 'cats' ? 'cats' : 'dogs';
    const checkQuery = `SELECT * FROM ${tableName} WHERE id = ?`;

    db.get(checkQuery, [id], (err, row) => {
      if (err) {
        res.status(500).send("Erro ao consultar o banco de dados");
      } else if (!row) {
        res.status(404).send("Registro não encontrado");
      } else {
        // Atualiza se o registro existe
        db.run(`UPDATE ${tableName} SET votes = votes + 1 WHERE id = ?`, [id], function (err) {
          if (err) {
            console.log('error running compute vote:', err);
            handleDatabaseError(res, "computar voto")(err);
          } else {
            res.status(200).send("Voto computado");
          }
        });
      }
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/cats', (req, res) => {
  db.all("SELECT * FROM cats", [], (err, rows) => {
    if (err) {
      console.log('error Erro ao consultar o banco de dados:', err);
      handleDatabaseError(res, "Erro ao consultar o banco de dados gatos")(err);
    } else {
      res.json(rows);
    }
  });
});

app.get('/dogs', (req, res) => {
  db.all("SELECT * FROM dogs", [], (err, rows) => {
    if (err) {
      console.log('error Erro ao consultar o banco de dados:', err);
      handleDatabaseError(res, "Erro ao consultar o banco de dados cachorros")(err);
    } else {
      res.json(rows);
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  console.log('error Erro:', err);
  handleDatabaseError(res, "Ocorreu um erro")(err);
});

app.listen(port, () => {
  console.log(`Cats and Dogs Vote app listening at http://localhost:${port}`);
});