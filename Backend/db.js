const mongoose = require('mongoose');
const mongURI = 'mongodb://127.0.0.1:27017/inotebook';

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongURI);
        console.log('Connected to MongoDB successfully...');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

module.exports = connectToMongo;
