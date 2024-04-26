const { Schema, model } = require('mongoose');

const ActividadFisicaSchema = Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        calorias: {
            type: Number,
            required: true
        },
        tiempoReferencia: {
            type: Number,
            required: true
        },
        predeterminada: {
            type: Boolean,
            default: false
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
        }
    }, { collection: 'actividades_fisicas' }
);

ActividadFisicaSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('ActividadFisica', ActividadFisicaSchema);