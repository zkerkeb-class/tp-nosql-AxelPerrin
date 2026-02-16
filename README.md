# API Pokémon - TP NoSQL

Une API REST complète pour gérer des Pokémon avec MongoDB, Express.js et authentification JWT.

## 🚀 Installation

```bash
npm install
cp .env.example .env
npm run seed
node index.js
```

Le serveur démarre sur `http://localhost:3000`

---

## 🗄️ Commandes mongosh

```bash
mongosh "mongodb+srv://<user>:<password>@cluster.mongodb.net/pokemons"
use pokemons
db.pokemons.countDocuments()
db.pokemons.findOne({ id: 25 })
exit
```

---

## 📖 Routes Pokémon (CRUD)

### GET - Lister tous les Pokémon
```
GET http://localhost:3000/api/pokemons
```

### GET - Récupérer un Pokémon par ID
```
GET http://localhost:3000/api/pokemons/25
```

### POST - Créer un Pokémon ⚠️ Token requis
```
POST http://localhost:3000/api/pokemons
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "id": 152,
  "name": {
    "english": "Chikorita",
    "french": "Germignon"
  },
  "type": ["Grass"],
  "base": {
    "HP": 45,
    "Attack": 49,
    "Defense": 65
  }
}
```

### PUT - Modifier un Pokémon ⚠️ Token requis
```
PUT http://localhost:3000/api/pokemons/152
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "base": {
    "HP": 999
  }
}
```

### DELETE - Supprimer un Pokémon ⚠️ Token requis
```
DELETE http://localhost:3000/api/pokemons/152
```
**Headers:**
```
Authorization: Bearer <token>
```

---

## 🔍 Filtrage, tri et pagination

### Filtrage par type
```
GET http://localhost:3000/api/pokemons?type=Fire
GET http://localhost:3000/api/pokemons?type=Water
GET http://localhost:3000/api/pokemons?type=Electric
```

### Recherche par nom
```
GET http://localhost:3000/api/pokemons?name=pika
GET http://localhost:3000/api/pokemons?name=char
```

### Tri
```
GET http://localhost:3000/api/pokemons?sort=name.french
GET http://localhost:3000/api/pokemons?sort=-base.HP
GET http://localhost:3000/api/pokemons?sort=-base.Attack
```

### Pagination
```
GET http://localhost:3000/api/pokemons?page=1&limit=20
GET http://localhost:3000/api/pokemons?page=2&limit=20
GET http://localhost:3000/api/pokemons?limit=10
```

### Combinaisons
```
GET http://localhost:3000/api/pokemons?type=Fire&sort=-base.Attack
GET http://localhost:3000/api/pokemons?type=Fire&sort=-base.Attack&page=1&limit=5
GET http://localhost:3000/api/pokemons?name=char&sort=name.english
```

---

## 🔐 Authentification

### POST - Inscription
```
POST http://localhost:3000/api/auth/register
```
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "username": "sacha",
  "password": "pikachu"
}
```

### POST - Connexion (récupère le token)
```
POST http://localhost:3000/api/auth/login
```
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "username": "sacha",
  "password": "pikachu"
}
```
**Réponse:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> 💡 **Dans Insomnia:** Copie le token de la réponse et ajoute-le dans les Headers des routes protégées : `Authorization: Bearer <token>`

---

## 📊 Statistiques

### GET - Stats agrégées (public)
```
GET http://localhost:3000/api/stats
```
**Réponse:**
```json
{
  "pokemonsByType": [...],
  "topAttacker": { "name": "Dragonite", "attack": 134 },
  "topHP": { "name": "Chansey", "hp": 250 }
}
```

---

## ⭐ Favoris ⚠️ Token requis

### GET - Lister mes favoris
```
GET http://localhost:3000/api/favorites
```
**Headers:**
```
Authorization: Bearer <token>
```

### POST - Ajouter un favori
```
POST http://localhost:3000/api/favorites/25
```
**Headers:**
```
Authorization: Bearer <token>
```

### DELETE - Retirer un favori
```
DELETE http://localhost:3000/api/favorites/25
```
**Headers:**
```
Authorization: Bearer <token>
```

---

## 👥 Équipes ⚠️ Token requis

### GET - Lister mes équipes
```
GET http://localhost:3000/api/teams
```
**Headers:**
```
Authorization: Bearer <token>
```

### POST - Créer une équipe (max 6 Pokémon)
```
POST http://localhost:3000/api/teams
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Dream Team",
  "pokemons": [25, 6, 149, 150, 151, 130]
}
```

---

## ✅ Validation

**Types valides:** `Normal`, `Fire`, `Water`, `Electric`, `Grass`, `Ice`, `Fighting`, `Poison`, `Ground`, `Flying`, `Psychic`, `Bug`, `Rock`, `Ghost`, `Dragon`, `Dark`, `Steel`, `Fairy`

**Stats valides:** entre 1 et 255

### Exemple - Type invalide (erreur 400)
```
POST http://localhost:3000/api/pokemons
```
**Body:**
```json
{
  "id": 999,
  "name": { "english": "Test", "french": "Test" },
  "type": ["Invalide"],
  "base": { "HP": 50, "Attack": 50, "Defense": 50 }
}
```

### Exemple - HP invalide (erreur 400)
```
POST http://localhost:3000/api/pokemons
```
**Body:**
```json
{
  "id": 999,
  "name": { "english": "Test", "french": "Test" },
  "type": ["Normal"],
  "base": { "HP": 999, "Attack": 50, "Defense": 50 }
}
```

### Exemple - Équipe > 6 Pokémon (erreur 400)
```
POST http://localhost:3000/api/teams
```
**Body:**
```json
{
  "name": "Trop grande",
  "pokemons": [1, 2, 3, 4, 5, 6, 7]
}
```

---

## 📁 Structure du projet

```
├── index.js           # Point d'entrée
├── package.json       # Dépendances
├── .env               # Variables d'environnement
├── db/
│   ├── connect.js     # Connexion MongoDB
│   └── seed.js        # Script d'import
├── models/
│   ├── pokemon.js     # Schéma Pokémon
│   ├── user.js        # Schéma User
│   └── team.js        # Schéma Team
├── routes/
│   ├── pokemons.js    # CRUD Pokémon
│   ├── auth.js        # Authentification
│   ├── favorites.js   # Favoris
│   ├── stats.js       # Statistiques
│   └── teams.js       # Équipes
├── middleware/
│   └── auth.js        # Middleware JWT
└── data/
    └── pokemons.json  # Données source
```

---

## 🔧 Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB Atlas** - Base de données cloud
- **Mongoose** - ODM pour MongoDB
- **bcrypt** - Hashage des mots de passe
- **jsonwebtoken** - Authentification JWT
- **dotenv** - Variables d'environnement
