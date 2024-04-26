const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        sexo: {
            type: String,
            required: true
        },
        altura: {
            type: Number,
            required: true
        },
        edad: {
            type: Number,
            required: true
        },
        pesoInicial: {
            type: Number,
            required: true
        },
        pesoObjetivo: {
            type: Number
        },
        pesoActual: {
            type: Number,
            required: true
        },
        pesoHistorico: {
            pesoMedio: {
                type: Number,
            },
            pesoMaximo: {
                type: Number,
            },
            pesoMinimo: {
                type: Number,
            }
        },
        plan: {
            tipo: {
                type: String,
                required: true
            },
            nivelActividad: {
                type: String,
                required: true
            },
            caloriasDiarias: {
                type: Number,
            },
            carbosDiarios: {
                type: Number,
            },
            proteinasDiarias: {
                type: Number,
            },
            grasasDiarias: {
                type: Number,
            }
        },
        distribucionComidas: {
            type: [String],
            default: ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena']
        },
        configuracion: {
            tema: {
                type: String,
                default: 'CLARO'
            }
        }
    }, { collection: 'usuarios' }
);

UsuarioSchema.method('toJSON', function(){
    const { __v, _id, password, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('Usuario', UsuarioSchema);