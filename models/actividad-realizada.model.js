const { Schema, model } = require('mongoose');

const ActividadRealizadaSchema = Schema(
    {
        fecha: {
            type: Date,
            required: true
        },
        caloriasGastadas: {
            type: Number,
            required: true
        },
        duracion: {
            type: Number,
            required: true
        },
        notas: {
            type: String,
        },
        idActividadFisica: {
            type: Schema.Types.ObjectId,
            ref: 'ActividadFisica',
            required: true
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        }
    }, { collection: 'actividades_realizadas' }
);

ActividadRealizadaSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('ActividadRealizada', ActividadRealizadaSchema);