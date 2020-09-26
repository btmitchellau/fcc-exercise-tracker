const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  const Exercise = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    date: Date,
    description: String,
    duration: Number,
  });

  const UserSchema = new mongoose.Schema({
    username: String,
    exercises: [Exercise],
  });

  const User = mongoose.model('exercise_users', UserSchema);

  exports.User = User;

  /*
      Creates a new user on the DB...
    */
  const createNewUser = (userName, res) => {
    User({
      username: userName,
    }).save((err, createdUser) => {
      if (err) {
        res.json({
          error: 'Unable to create user',
        });
      } else {
        res.json({
          username: userName,
          _id: createdUser.id,
        });
      }
    });
  };
  exports.createNewUser = createNewUser;
});
