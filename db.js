const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('connected');
    const Exercise = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        date: Date,
        description: String,
        duration: Number
    })

    const User = new mongoose.Schema({
        username: String,
        exercises: [Exercise]
    });

    exports.User = mongoose.model('exercise_users', User)
    
    });
  
