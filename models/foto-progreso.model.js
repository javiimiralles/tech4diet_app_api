const { Schema, model } = require('mongoose');

const FotoProgresoSchema = Schema(
    {
        fecha: {
            type: Date,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        idCloudinary: {
            type: String,
            required: true
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        }
    }, { collection: 'fotos_progreso' }
);

FotoProgresoSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('FotoProgreso', FotoProgresoSchema);