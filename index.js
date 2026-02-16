// Charger les variables d'environnement en PREMIER (avant tout autre import)
// dotenv lit le fichier .env et rend les variables accessibles via process.env
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import pokemonsRouter from './routes/pokemons.js';
import authRouter from './routes/auth.js';
import favoritesRouter from './routes/favorites.js';
import statsRouter from './routes/stats.js';
import teamsRouter from './routes/teams.js';
import connectDB from './db/connect.js';



const app = express();

app.use(cors()); // Permet les requêtes cross-origin (ex: frontend sur un autre port)

app.use('/assets', express.static('assets')); // Permet d'accéder aux fichiers dans le dossier "assets" via l'URL /assets/...

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Routes Auth
app.use('/api/auth', authRouter);

// Routes Pokémon
app.use('/api/pokemons', pokemonsRouter);

// Routes Favoris
app.use('/api/favorites', favoritesRouter);

// Routes Stats
app.use('/api/stats', statsRouter);

// Routes Teams
app.use('/api/teams', teamsRouter);


// Connexion à MongoDB puis lancement du serveur
connectDB().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
    });
});
