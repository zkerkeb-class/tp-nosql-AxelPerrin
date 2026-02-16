import mongoose from 'mongoose';

// Liste des types autorisés
const VALID_TYPES = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", 
    "Fighting", "Poison", "Ground", "Flying", "Psychic", 
    "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

const pokemonSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: [true, 'L\'ID est requis'],
        unique: true,
        min: [1, 'L\'ID doit être un entier positif'],
        validate: {
            validator: Number.isInteger,
            message: 'L\'ID doit être un entier'
        }
    },
    name: {
        english: { 
            type: String, 
            required: [true, 'Le nom anglais est requis'] 
        },
        french: { 
            type: String, 
            required: [true, 'Le nom français est requis'] 
        },
        japanese: { type: String },
        chinese: { type: String }
    },
    type: {
        type: [String],
        required: [true, 'Au moins un type est requis'],
        validate: {
            validator: function(types) {
                return types.length > 0 && types.every(t => VALID_TYPES.includes(t));
            },
            message: `Les types doivent faire partie de la liste: ${VALID_TYPES.join(', ')}`
        }
    },
    base: {
        HP: { 
            type: Number, 
            required: [true, 'Les HP sont requis'],
            min: [1, 'Les HP doivent être entre 1 et 255'],
            max: [255, 'Les HP doivent être entre 1 et 255']
        },
        Attack: { 
            type: Number, 
            required: [true, 'L\'attaque est requise'],
            min: [1, 'L\'attaque doit être entre 1 et 255'],
            max: [255, 'L\'attaque doit être entre 1 et 255']
        },
        Defense: { 
            type: Number, 
            required: [true, 'La défense est requise'],
            min: [1, 'La défense doit être entre 1 et 255'],
            max: [255, 'La défense doit être entre 1 et 255']
        },
        SpecialAttack: { 
            type: Number,
            min: [1, 'L\'attaque spéciale doit être entre 1 et 255'],
            max: [255, 'L\'attaque spéciale doit être entre 1 et 255']
        },
        SpecialDefense: { 
            type: Number,
            min: [1, 'La défense spéciale doit être entre 1 et 255'],
            max: [255, 'La défense spéciale doit être entre 1 et 255']
        },
        Speed: { 
            type: Number,
            min: [1, 'La vitesse doit être entre 1 et 255'],
            max: [255, 'La vitesse doit être entre 1 et 255']
        }
    }
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export default Pokemon;
