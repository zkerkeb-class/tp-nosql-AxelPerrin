import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter l'utilisateur décodé à req.user
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token invalide' });
    }
};

export default authMiddleware;
