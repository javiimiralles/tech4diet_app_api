const { Schema, model } = require('mongoose');

const DiarioSchema = Schema(
    {
        fecha: {
            type: Date,
            default: new Date()
        },
        alimentosConsumidos: [
            {
                idAlimento: {
                    type: Schema.Types.ObjectId,
                    ref: 'Alimento',
                },
                calorias: {
                    type: Number
                },
                carbohidratos: {
                    type: Number
                },
                proteinas: {
                    type: Number
                },
                grasas: {
                    type: Number
                },
                cantidad: {
                    type: Number,
                },
                categoria: {
                    type: String,
                }
            }
        ],
        aguaConsumida: {
            type: Number,
            default: 0
        },
        caloriasGastadas: {
            type: Number,
            default: 0
        },
        caloriasConsumidas: {
            type: Number,
            default: 0
        },
        carbosConsumidos: {
            type: Number,
            default: 0
        },
        proteinasConsumidas: {
            type: Number,
            default: 0
        },
        grasasConsumidas: {
            type: Number,
            default: 0
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        }
    }, { collection: 'diarios' }
);

DiarioSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('Diario', DiarioSchema);