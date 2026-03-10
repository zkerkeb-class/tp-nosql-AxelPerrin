import express from 'express';
import Team from '../models/team.js';
import Pokemon from '../models/pokemon.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /api/teams - Créer une équipe
router.post('/', auth, async (req, res) => {
    try {
        const { name, pokemons } = req.body;
        
        // Vérifier que les Pokémon existent
        if (pokemons && pokemons.length > 0) {
            const existingPokemons = await Pokemon.find({ id: { $in: pokemons } });
            if (existingPokemons.length !== pokemons.length) {
                return res.status(400).json({ error: 'Certains Pokémon n\'existent pas' });
            }
        }
        
        const team = await Team.create({
            user: req.user.id,
            name,
            pokemons: pokemons || []
        });
        
        res.status(201).json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/teams - Lister mes équipes
router.get('/', auth, async (req, res) => {
    try {
        const teams = await Team.find({ user: req.user.id });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/teams/:id - Détail d'une équipe avec populate
router.get('/:id', auth, async (req, res) => {
    try {
        const team = await Team.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        });
        
        if (!team) {
            return res.status(404).json({ error: 'Équipe non trouvée' });
        }
        
        // Récupérer les données complètes des Pokémon
        const pokemonsData = await Pokemon.find({ id: { $in: team.pokemons } });
        
        res.json({
            _id: team._id,
            name: team.name,
            pokemons: pokemonsData,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/teams/:id - Modifier une équipe
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, pokemons } = req.body;
        
        // Vérifier que l'équipe appartient à l'utilisateur
        const team = await Team.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        });
        
        if (!team) {
            return res.status(404).json({ error: 'Équipe non trouvée' });
        }
        
        // Vérifier que les Pokémon existent
        if (pokemons && pokemons.length > 0) {
            const existingPokemons = await Pokemon.find({ id: { $in: pokemons } });
            if (existingPokemons.length !== pokemons.length) {
                return res.status(400).json({ error: 'Certains Pokémon n\'existent pas' });
            }
        }
        
        // Mettre à jour
        if (name) team.name = name;
        if (pokemons !== undefined) team.pokemons = pokemons;
        
        await team.save();
        
        res.json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/teams/:id - Supprimer une équipe
router.delete('/:id', auth, async (req, res) => {
    try {
        const team = await Team.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });
        
        if (!team) {
            return res.status(404).json({ error: 'Équipe non trouvée' });
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
