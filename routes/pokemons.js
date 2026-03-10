import express from 'express';
import Pokemon from '../models/pokemon.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const filter = {};
        
        // Filtre par type
        if (req.query.type) {
            filter.type = req.query.type;
        }
        
        // Recherche par nom (partiel, insensible à la casse)
        if (req.query.name) {
            filter["name.english"] = { $regex: req.query.name, $options: 'i' };
        }
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        
        // Compte total pour les métadonnées
        const total = await Pokemon.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
        
        // Requête avec tri et pagination
        let query = Pokemon.find(filter);
        if (req.query.sort) {
            query = query.sort(req.query.sort);
        }
        query = query.skip(skip).limit(limit);
        
        const pokemons = await query;
        
        res.json({
            data: pokemons,
            page,
            limit,
            total,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const pokemon = await Pokemon.findOne({ id });
        
        if (pokemon) {
            res.status(200).json(pokemon);
        } else {
            res.status(404).json({ error: 'Pokémon non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const pokemon = await Pokemon.create(req.body);
        res.status(201).json(pokemon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const pokemon = await Pokemon.findOneAndUpdate({ id }, req.body, { new: true });
        
        if (pokemon) {
            res.status(200).json(pokemon);
        } else {
            res.status(404).json({ error: 'Pokémon non trouvé' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const pokemon = await Pokemon.findOneAndDelete({ id });
        
        if (pokemon) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Pokémon non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
