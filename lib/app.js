const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

<<<<<<< HEAD
// app.use('/slack/zoom',require('./controllers/zoom'));
app.use('/slack/canvas',require('./controllers/canvas'));
// app.use('/slack/calendar',require('./controllers/calendar'));
// app.use('/slack/calendar',require('./controllers/calendar'));
app.use('/slack/npm', require('./controllers/npm'));
app.use('/slack/futurama',require('./controllers/fun-stuff'));
=======
app.use('/slack/zoom', require('./controllers/zoom'));
// app.use('/slack/canvas', require('./controllers/canvas'));
app.use('/slack/calendar', require('./controllers/calendar'));
// app.use('/slack/npm', require('./controllers/npm'));
// app.use('/slack/futurama', require('./controllers/fun-stuff'));
app.use('/slack/interaction', require('./controllers/interaction'));
>>>>>>> 2c775fe... merge conflict 1

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
