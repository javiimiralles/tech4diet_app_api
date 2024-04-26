const { Schema, model } = require('mongoose');

const MedidaCorporalSchema = Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        bilateral: {
            type: Boolean,
            required: true
        },
        medida1: {
            type: Number,
        },
        medida2: {
            type: Number,
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        }
    }, { collection: 'medidas_corporales' }
);

MedidaCorporalSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

module.exports = model('MedidaCorporal', MedidaCorporalSchema);