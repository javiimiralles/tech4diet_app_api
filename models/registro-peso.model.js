const { Schema, model } = require('mongoose');

const RegistroPesoSchema = Schema(
    {
        fecha: {
            type: Date,
            required: true
        },
        peso: {
            type: Number,
            required: true
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        }
    }, { collection: 'registros_peso' }
);

RegistroPesoSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('RegistroPeso', RegistroPesoSchema);