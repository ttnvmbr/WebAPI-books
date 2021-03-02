let mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');


const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        author: { type: String, required: true},
        body: { type: String, required: true},
    }
);
bookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Book', bookSchema);