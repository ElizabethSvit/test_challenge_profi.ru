require('dotenv').config();

const express = require('express');
const path = require('path');
const dns = require('dns');
const {MongoClient} = require('mongodb');
const bodyParser = require('body-parser');

const databaseUrl = process.env.DATABASE;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(databaseUrl, {useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        app.locals.db = client.db('shortener');
    })
    .catch(() => console.error('Failed to connect to the database'));

function randomizeId(url, length = 8) {
    let short_id = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charLen = chars.length;
    for (let i = 0; i < length; i++) {
        short_id += chars.charAt(Math.floor(Math.random() * charLen));
    }
    console.log(short_id);
    return short_id;
}

const shortenURL = (db, url) => {
    const shortenedURLs = db.collection('shortenedURLs');
    shortenedURLs.createIndex({"short_id": 1});

    return shortenedURLs.findOneAndUpdate({original_url: url},
        {
            $setOnInsert: {
                original_url: url,
                short_id: randomizeId(url),
            },
        },
        {
            returnOriginal: false,
            upsert: true,
        }
    );
};

const checkIfShortIdExists = (db, code) => db.collection('shortenedURLs')
    .findOne({short_id: code});

const updateCallTimes = (db, code) => db.collection('shortenedURLs')
    .updateOne({short_id: code}, {$inc: {times_called: 1}});

const getAllOriginalLinks = (db) => db.collection('shortenedURLs')
    .distinct("original_url");

const getStatsByShortId = (db, shortId) => db.collection('shortenedURLs')
    .findOne({short_id: shortId});

app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'page', 'index.html');
    res.sendFile(htmlPath);
});

app.get('/stats/:short_id', (req, res) => {
    const shortId = req.params.short_id;
    const {db} = req.app.locals;

    getStatsByShortId(db, shortId)
        .then(link => {
            res.json({
                short_id: shortId,
                times_called: link.times_called
            });
        })
        .catch(console.error);
});

app.get('/links', (req, res) => {
    const {db} = req.app.locals;

    getAllOriginalLinks(db)
        .then(urls => {
            res.send(urls);
        })
        .catch(console.error);
});

app.get('/:short_id', (req, res) => {
    const shortId = req.params.short_id;

    const {db} = req.app.locals;
    checkIfShortIdExists(db, shortId)
        .then(doc => {
            if (doc === null) return res.send('Link at that URL is not found');

            res.redirect(doc.original_url);
        })
        .catch(console.error);

    updateCallTimes(db, shortId);
});

app.post('/new', (req, res) => {
    let originalUrl;
    try {
        originalUrl = new URL(req.body.url);
    } catch (err) {
        return res.status(400).send({error: 'URL is invalid'});
    }

    dns.lookup(originalUrl.hostname, (err) => {
        if (err) {
            return res.status(404).send({error: 'Address not found'});
        }

        const {db} = req.app.locals;
        shortenURL(db, originalUrl.href)
            .then(result => {
                const doc = result.value;
                res.json({
                    original_url: doc.original_url,
                    short_id: doc.short_id,
                });
            })
            .catch(console.error);
    });
});

app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
});
