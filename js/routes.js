const db = require('../db/db.js');

const init = (app) => {
  /*
    Route that creates a new user if one doesn't already exist...
  */
  app.post('/api/exercise/new-user', (req, res) => {
    // Check the user exists...
    db.User.findOne({
      name: req.body.username,
    }, (err, userRecord) => {
      if (err) {
        res.json({
          error: 'Error checking if user exists',
        });
      } else if (userRecord == null) { // create new user it doesn't...
        db.createNewUser(req.body.username, res);
      } else {
        res.json({
          error: 'user already exists!',
        });
      }
    });
  });

  /*
    Returns a list of all users....
  */
  app.get('/api/exercise/users', (req, res) => {
    const query = db.User.find().select('username __id');
    query.exec((err, users) => {
      if (err) {
        res.json({
          error: 'unable to retrieve user list',
        });
      } else {
        res.json(users);
      }
    });
  });

  /*
    Route that records a new exercise for a user...
  */
  app.post('/api/exercise/add', (req, res) => {
    // date defaults to now if nothing passed in the request
    let theDate = new Date().toDateString();
    if (req.body.date !== undefined) {
      theDate = new Date(req.body.date).toDateString();
    }

    const newExercise = {
      userId: req.body.userId,
      description: req.body.description,
      duration: parseInt(req.body.duration, 10),
      date: theDate,
    };

    // update the user...
    db.User.updateOne({
      _id: newExercise.userId,
    }, {
      $addToSet: {
        exercises: [newExercise],
      },
    },
    (err) => {
      if (err) {
        res.json({
          error: 'unable to add new exercise',
        });
      } else { // update success
        const query = db.User.find({
          _id: req.body.userId,
        });
          // query the user record and return the new, updated details
        query.exec((_err, user) => {
          const response = {
            username: user[0].username,
            description: newExercise.description,
            duration: newExercise.duration,
            _id: req.body.userId,
            date: newExercise.date,
          };

          res.json(response);
        });
      }
    });
  });

  /*
    Returns the exercise log of a user...
  */
  app.get('/api/exercise/log', (req, res) => {
    db.User.findOne({
      _id: req.query.userId,
    }).exec((err, user) => {
      if (err) {
        res.send(err);
      } else if (!user) {
        res.json({
          error: 'user not found',
        });
      } else {
        // further filter results if requested...

        let filteredExercises = user.exercises.toObject();
        if (req.query.from !== undefined) {
          filteredExercises = filteredExercises.filter((exercise) => exercise.date.getTime() > new Date(req.query.from).getTime());
        }

        if (req.query.from !== undefined) {
          filteredExercises = filteredExercises.filter((exercise) => exercise.date.getTime() > new Date(req.query.from).getTime());
        }

        if (req.query.limit !== undefined) {
          filteredExercises = filteredExercises.slice(0, req.query.limit);
        }

        res.json({
          user: user.username,
          log: filteredExercises,
          count: filteredExercises.length,
        });
      }
    });
  });
};

module.exports.init = init;
