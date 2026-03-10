import express from 'express';
import User from '../models/user.js';
import Pokemon from '../models/pokemon.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/favorites - Lister mes Pokémon favoris
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Récupérer les Pokémon correspondants aux IDs favoris
        const pokemons = await Pokemon.find({ id: { $in: user.favorites } });
        
        res.json(pokemons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/favorites/:pokemonId - Ajouter un favori
router.post('/:pokemonId', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);
        
        // Vérifier que le Pokémon existe
        const pokemon = await Pokemon.findOne({ id: pokemonId });
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }
        
        // Ajouter sans doublon avec $addToSet
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { favorites: pokemonId }
        });
        
        res.status(201).json({ message: 'Pokémon ajouté aux favoris', pokemonId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/favorites/:pokemonId - Retirer un favori
router.delete('/:pokemonId', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);
        
        // Retirer avec $pull
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { favorites: pokemonId }
        });
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
