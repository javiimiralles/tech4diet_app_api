const { Schema, model } = require('mongoose');

const AlimentoSchema = Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        marca: {
            type: String,
        },
        cantidadReferencia: {
            type: Number,
            required: true
        },
        unidadMedida: {
            type: String,
            required: true
        },
        calorias: {
            type: Number,
            required: true
        },
        carbohidratos: {
            type: Number,
            required: true
        },
        proteinas: {
            type: Number,
            required: true
        },
        grasas: {
            type: Number,
            required: true
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        }
    }, { collection: 'alimentos' }
);

AlimentoSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('Alimento', AlimentoSchema);