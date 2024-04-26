const { Schema, model } = require('mongoose');

const Modelo3DSchema = Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        fecha: {
            type: Date,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        }
    }, { collection: 'modelos3D' }
);

Modelo3DSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('Modelo3D', Modelo3DSchema);