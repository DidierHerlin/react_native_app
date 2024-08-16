const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Créer une connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Remplace par ton utilisateur MySQL
  password: '', // Remplace par ton mot de passe MySQL
  database: 'gestion_vente'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données: ' + err.stack);
    return;
  }
  console.log('Connecté à la base de données MySQL.');
});

// Route pour ajouter un article
app.post('/articles', (req, res) => {
  const { idApp, surface, ville, prix, description, status, photo_urls } = req.body;
  const sql = 'INSERT INTO articles (idApp, surface, ville, prix, description, status, photo_urls) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [idApp, surface, ville, prix, description, status, photo_urls], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'insertion :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Article ajouté avec succès' });
  });
});

// Route pour obtenir tous les articles
app.get('/articles', (req, res) => {
  db.query('SELECT * FROM articles', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});


///obtention chaque art
app.get('/articles/:id', (req, res) => {
  const articleId = req.params.id;
  const sql = 'SELECT * FROM articles WHERE id = ?';
  db.query(sql, [articleId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.status(200).json(results[0]);
  });
});

// Route pour modifier un article
app.put('/articles/:id', (req, res) => {
  const articleId = req.params.id;
  const { idApp, surface, ville, prix, description, status, photo_urls } = req.body;
  const sql = 'UPDATE articles SET idApp = ?, surface = ?, ville = ?, prix = ?, description = ?, status = ?, photo_urls = ? WHERE id = ?';
  db.query(sql, [idApp, surface, ville, prix, description, status, photo_urls, articleId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour :', err);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article' });
    }
    res.json({ message: 'Article mis à jour avec succès' });
  });
});


// Route pour supprimer un article
app.delete('/articles/:id', (req, res) => {
  const articleId = req.params.id;
  const sql = 'DELETE FROM articles WHERE id = ?';
  db.query(sql, [articleId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression :', err);
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'article' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json({ message: 'Article supprimé avec succès' });
  });
});


app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://127.0.0.1:3000/articles`);
});
