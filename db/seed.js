import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import Pokemon from '../models/pokemon.js';

const seed = async () => {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB !');

        // Lire les données depuis pokemons.json
        const data = fs.readFileSync('./data/pokemons.json', 'utf-8');
        const pokemons = JSON.parse(data);

        // Supprimer les anciens documents
        await Pokemon.deleteMany({});
        console.log('Collection vidée.');

        // Insérer tous les Pokémon
        const result = await Pokemon.insertMany(pokemons);
        console.log(`${result.length} Pokémon insérés avec succès !`);

        // Fermer la connexion
        await mongoose.connection.close();
        console.log('Connexion fermée.');

    } catch (error) {
        console.error('Erreur:', error.message);
        process.exit(1);
    }
};

seed();
