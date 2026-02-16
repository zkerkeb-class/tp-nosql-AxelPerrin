# API Pokémon - TP NoSQL

Une API REST complète pour gérer des Pokémon avec MongoDB, Express.js et authentification JWT.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Copier .env.example vers .env et remplir les valeurs
cp .env.example .env

# Importer les données (151 Pokémon)
npm run seed

# Lancer le serveur
node index.js
```

Le serveur démarre sur `http://localhost:3000`

---

## 🗄️ Commandes mongosh

Connexion à la base de données avec mongosh :

```bash
# Connexion à MongoDB Atlas
mongosh "mongodb+srv://<user>:<password>@cluster.mongodb.net/pokemons"

# Vérifier la base de données
use pokemons

# Compter les documents (doit retourner 151)
db.pokemons.countDocuments()

# Trouver Pikachu
db.pokemons.findOne({ id: 25 })

# Quitter
exit
```

---

## 📖 Routes disponibles

### Routes publiques (GET)

#### Lister tous les Pokémon
```powershell
Invoke-RestMethod -Method GET http://localhost:3000/api/pokemons
```

#### Récupérer un Pokémon par ID
```powershell
Invoke-RestMethod -Method GET http://localhost:3000/api/pokemons/25
```

### Routes protégées (nécessitent un token JWT)

#### Créer un nouveau Pokémon
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/pokemons -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"id": 152, "name": {"english": "Chikorita", "french": "Germignon"}, "type": ["Grass"], "base": {"HP": 45, "Attack": 49, "Defense": 65}}'
```

#### Modifier un Pokémon existant
```powershell
Invoke-RestMethod -Method PUT -Uri http://localhost:3000/api/pokemons/152 -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"base": {"HP": 999}}'
```

#### Supprimer un Pokémon
```powershell
Invoke-RestMethod -Method DELETE -Uri http://localhost:3000/api/pokemons/152 -Headers @{Authorization="Bearer $token"}
```

---

## 🔍 Filtrage, tri et pagination

### Filtrage par type

```powershell
# Tous les Pokémon de type Fire
Invoke-RestMethod "http://localhost:3000/api/pokemons?type=Fire"

# Tous les Pokémon de type Water
Invoke-RestMethod "http://localhost:3000/api/pokemons?type=Water"

# Tous les Pokémon (sans filtre)
Invoke-RestMethod "http://localhost:3000/api/pokemons"
```

### Recherche par nom partiel

```powershell
# Rechercher "pika"
Invoke-RestMethod "http://localhost:3000/api/pokemons?name=pika"

# Rechercher "char"
Invoke-RestMethod "http://localhost:3000/api/pokemons?name=char"
```

### Tri

```powershell
# Tri alphabétique par nom français
Invoke-RestMethod "http://localhost:3000/api/pokemons?sort=name.french"

# Tri par HP décroissant
Invoke-RestMethod "http://localhost:3000/api/pokemons?sort=-base.HP"

# Combiner filtre + tri
Invoke-RestMethod "http://localhost:3000/api/pokemons?type=Fire&sort=-base.Attack"
```

### Pagination

```powershell
# Page 1, 20 résultats
Invoke-RestMethod "http://localhost:3000/api/pokemons?page=1&limit=20"

# Page 2, 20 résultats
Invoke-RestMethod "http://localhost:3000/api/pokemons?page=2&limit=20"

# Les 10 premiers
Invoke-RestMethod "http://localhost:3000/api/pokemons?limit=10"

# Combo : 5 Pokémon Feu les plus puissants en attaque
Invoke-RestMethod "http://localhost:3000/api/pokemons?type=Fire&sort=-base.Attack&page=1&limit=5"
```

---

## 🔐 Authentification

### Inscription

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/register -ContentType "application/json" -Body '{"username": "sacha", "password": "pikachu"}'
```

### Connexion

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"username": "sacha", "password": "pikachu"}'
```

### Cas d'erreur

```powershell
# Mauvais mot de passe
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"username": "sacha", "password": "mauvais"}'

# Utilisateur inexistant
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"username": "inconnu", "password": "test"}'

# Doublon d'inscription
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/register -ContentType "application/json" -Body '{"username": "sacha", "password": "autre"}'
```

### Utilisation du token

```powershell
# Stocker le token dans une variable
$token = (Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"username": "sacha", "password": "pikachu"}').token

# Voir le token
$token
```

---

## 🛡️ Routes protégées - Exemples

```powershell
# 1. POST sans token (retourne 401)
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/pokemons -ContentType "application/json" -Body '{"id": 999, "name": {"english": "Test", "french": "Test"}, "type": ["Normal"], "base": {"HP": 50, "Attack": 50, "Defense": 50}}'

# 2. Se connecter et récupérer le token
$token = (Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"username": "sacha", "password": "pikachu"}').token

# 3. POST avec token (retourne 201)
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/pokemons -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"id": 999, "name": {"english": "Test", "french": "Test"}, "type": ["Normal"], "base": {"HP": 50, "Attack": 50, "Defense": 50}}'

# 4. DELETE sans token (retourne 401)
Invoke-RestMethod -Method DELETE -Uri http://localhost:3000/api/pokemons/999

# 5. DELETE avec token (retourne 204)
Invoke-RestMethod -Method DELETE -Uri http://localhost:3000/api/pokemons/999 -Headers @{Authorization="Bearer $token"}

# 6. GET reste public (fonctionne sans token)
Invoke-RestMethod http://localhost:3000/api/pokemons/25
```

---

## 📊 Statistiques

Route publique qui retourne des statistiques agrégées :

```powershell
Invoke-RestMethod http://localhost:3000/api/stats
```

Retourne :
- Nombre de Pokémon par type
- Pokémon avec la plus haute attaque
- Pokémon avec le plus de HP

---

## ⭐ Favoris

Routes protégées pour gérer ses Pokémon favoris :

```powershell
# Se connecter
$token = (Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"username": "sacha", "password": "pikachu"}').token

# Ajouter un favori
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/favorites/25 -Headers @{Authorization="Bearer $token"}

# Lister mes favoris
Invoke-RestMethod -Uri http://localhost:3000/api/favorites -Headers @{Authorization="Bearer $token"}

# Retirer un favori
Invoke-RestMethod -Method DELETE -Uri http://localhost:3000/api/favorites/25 -Headers @{Authorization="Bearer $token"}
```

---

## 👥 Équipes

Routes protégées pour gérer ses équipes de Pokémon (max 6 par équipe) :

```powershell
# Se connecter
$token = (Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"username": "sacha", "password": "pikachu"}').token

# Créer une équipe
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/teams -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"name": "Dream Team", "pokemons": [25, 6, 149, 150, 151, 130]}'

# Lister mes équipes
Invoke-RestMethod -Uri http://localhost:3000/api/teams -Headers @{Authorization="Bearer $token"}
```

---

## ✅ Validation

L'API valide les données avant insertion :

```powershell
# Type invalide (erreur)
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/pokemons -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"id": 999, "name": {"english": "Test", "french": "Test"}, "type": ["Invalide"], "base": {"HP": 50, "Attack": 50, "Defense": 50}}'
```

Types valides : `Normal`, `Fire`, `Water`, `Electric`, `Grass`, `Ice`, `Fighting`, `Poison`, `Ground`, `Flying`, `Psychic`, `Bug`, `Rock`, `Ghost`, `Dragon`, `Dark`, `Steel`, `Fairy`

Stats valides : entre 1 et 255

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
