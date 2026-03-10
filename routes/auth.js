import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris' });
        }
        
        // Créer l'utilisateur (le pre-save hashera le mdp)
        const user = await User.create({ username, password });
        
        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Vérifier que l'utilisateur existe
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        
        // Comparer le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        
        // Générer le JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
