const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const localSchema = new Schema({
    name: { type: String },
    loc: {
        type: { type: String },
        coordinates: [Number],
    },
    address: String,
    concurrency: [{
        vote: String,
        time: { type: Date, default: Date.now }
    }]
});
localSchema.index({ loc: '2dsphere' });
const localModel = mongoose.model('locals', localSchema);
module.exports = localModel;