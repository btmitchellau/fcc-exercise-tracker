const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db.js');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.post('/api/exercise/new-user', (req, res) => {
  // Check the user exists...
  db.User.findOne({
    name: req.body.username,
  }, (err, userFound) => {
    if (err) {
      res.json({
        error: 'Error checking for user',
      });
    } else if (userFound == null) { // create if it doesn't...
      const newUser = db.User({
        username: req.body.username,
      });
      newUser.save((_err, data) => {
        res.json({
          username: req.body.username,
          _id: data.id,
        });
      });
    } else {
      res.json({
        error: 'user already exists!',
      });
    }
  });
});

app.get('/api/exercise/users', (req, res) => {
  const query = db.User.find({}).select('username __id');
  query.exec((err, users) => {
    res.json(users);
  });
});

app.post('/api/exercise/add', (req, res) => {
  let theDate = new Date().toDateString();
  if (req.body.date !== undefined) {
    theDate = new Date(req.body.date).toDateString();
  }

  const update = {
    userId: req.body.userId,
    description: req.body.description,
    duration: parseInt(req.body.duration, 10),
    date: theDate,
  };

  db.User.updateOne({
    _id: req.body.userId,
  }, {
    $addToSet: {
      exercises: [update],
    },
  },
  (err) => {
    if (err) {
      res.send(err);
    } else {
      const query = db.User.find({
        _id: req.body.userId,
      });
      query.exec((_err, user) => {
        const response = {
          username: user[0].username,
          description: update.description,
          duration: parseInt(update.duration, 10),
          _id: req.body.userId,
          date: update.date,
        };

        res.json(response);
      });
    }
  });
});

app.get('/api/exercise/log', (req, res) => {
  db.User.findOne({
    _id: req.query.userId,
  }).exec((err, user) => {
    if (err) {
      res.send(err);
    } else if (!user) {
      res.json({
        error: 'user not found'
      });
    } else {
      let filteredExercises = user.exercises.toObject();
      if (req.query.from !== undefined) {
        filteredExercises = filteredExercises.filter((exercise) => {
          return exercise.date.getTime() > new Date(req.query.from).getTime();
        });
      }

      if (req.query.from !== undefined) {
        filteredExercises = filteredExercises.filter((exercise) => {
          return exercise.date.getTime() > new Date(req.query.from).getTime();
        });
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

// Not found middleware
app.use((req, res, next) => next({
  status: 404,
  message: 'not found',
}));

// Error Handling middleware
app.use((err, req, res) => {
  let errCode;
  let errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res.status(errCode).type('txt')
    .send(errMessage);
});

app.listen(process.env.PORT || 3000, () => {
  //  console.log(`Your app is listening on port ${listener.address().port}`);
});
