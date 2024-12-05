const express = require('express');
const { MongoClient } = require('mongodb');
const server = express();
const { readFile } = require('fs').promises;
const ejs = require('ejs');

require('dotenv').config();

const port = 8080;
const client = new MongoClient(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });
const dataBaseName = "Atividade";
const collectionName = "Receitas";

server.set('view engine', 'ejs');

server.use(express.static('public'));

// Rota principal para renderizar index.ejs com dados do banco de dados
server.get('/', async (request, response) => {
    try {
        await client.connect();
        const receitas = await client.db(dataBaseName).collection(collectionName).find().toArray();
        response.render('index', { receitas: receitas });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erro ao carregar receitas');
    }
});

// Rota dinâmica para cada receita
server.get('/receitas/:nome', async (request, response) => {
    try {
        await client.connect();
        const nomeReceita = request.params.nome.replace(/-/g, ' ');
        const receita = await client.db(dataBaseName).collection(collectionName).findOne({ nome: new RegExp('^' + nomeReceita + '$', 'i') });
        if (receita) {
            response.render('recipe', { receita: receita });
        } else {
            response.status(404).send('Receita não encontrada');
        }
    } catch (error) {
        console.error(error);
        response.status(500).send('Erro ao carregar a receita');
    }
});

server.use(async (request, response) => {
    response.status(404).send(await readFile('./404.html', 'utf8'));
});

server.listen(process.env.PORT || port, () => console.log(`App available on http://localhost:${port}`));