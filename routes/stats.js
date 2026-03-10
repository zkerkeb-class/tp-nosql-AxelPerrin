import express from 'express';
import Pokemon from '../models/pokemon.js';

const router = express.Router();

// GET /api/stats - Statistiques avancées avec agrégation
router.get('/', async (req, res) => {
    try {
        // Nombre de Pokémon par type et moyenne des HP par type
        const statsByType = await Pokemon.aggregate([
            { $unwind: '$type' },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    avgHP: { $avg: '$base.HP' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Pokémon avec le plus d'attaque
        const topAttack = await Pokemon.aggregate([
            { $sort: { 'base.Attack': -1 } },
            { $limit: 1 },
            {
                $project: {
                    id: 1,
                    name: '$name.english',
                    attack: '$base.Attack'
                }
            }
        ]);

        // Pokémon avec le plus de HP
        const topHP = await Pokemon.aggregate([
            { $sort: { 'base.HP': -1 } },
            { $limit: 1 },
            {
                $project: {
                    id: 1,
                    name: '$name.english',
                    hp: '$base.HP'
                }
            }
        ]);

        res.json({
            pokemonsByType: statsByType,
            topAttacker: topAttack[0] || null,
            topHP: topHP[0] || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
