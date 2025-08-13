// Import required modules
var express = require('express');
var mongoose = require('mongoose')
var app = express();
var database = require('./config/database')
var bodyParser = require('body-parser')
var fs = require('fs')
const path = require('path')
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setting the server port (use environment variable if available, otherwise 3000)
const port = process.env.PORT || 3000;

// Import express-handlebars for template rendering
const exphbs = require('express-handlebars');

const Movie = require('./models/movies')

// Serving static files (CSS, images, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect(database.url)

// Connection events
mongoose.connection.on('connecting', () => {
  console.log('Mongoose is connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB!');
});

mongoose.connection.on('open', () => {
  console.log('Mongoose connection is open.');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB.');
});

mongoose.connection.on('reconnected', () => {
  console.log('Mongoose reconnected to MongoDB!');
});

// Setting up Handlebars as the template engine, using .hbs file extension
const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        oneBased: function (index) { return index + 1; },
        hasMetascore: function (metascore, options) {
            // Make metascore a string always
            if (typeof metascore !== "string") metascore = String(metascore || '');
            if (metascore.trim() !== '' && metascore.trim().toUpperCase() !== 'N/A') {
                return options.fn(this);
            }
            return '';
        },
        isBlankMetascore: function (metascore, options) {
            if (typeof metascore !== "string") metascore = String(metascore || '');
            if (metascore.trim() === '' || metascore.trim().toUpperCase() === 'N/A') {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }
});
app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');

// Find all movies
app.get('/movies', async (req, res) => {
    try {
        const movies = await Movie.find().lean()
        // res.json(movies)
        res.render('allMovies', { title: 'All Movies', movies });
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Find movies by ID:
app.get('/api/movies/id/:movie_id', async (req, res) => {
    try {
        let id = req.params.movie_id
        const movie = await Movie.findById(id)
        res.json(movie)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Find movies by title
app.get('/api/movies/title/:title', async (req, res) => {
    try {
        let title = req.params.title
        const movie = await Movie.find({Title: {$regex: title, Options: 'i'}})
        res.json(movie)
    } catch (err) {
        res.status(500).send(err.message)
    }
})


app.get('/movies/new', (req, res) => {
    res.render('newMovie', { title: 'Add New Movie' });
});

app.post('/movies', async (req, res) => {
    console.log(req.body)
    try {
        const newMovie = await Movie.create({
            Movie_ID: Number(req.body.Movie_ID),
            Title: req.body.Title,
            Year: req.body.Year ? Number(req.body.Year) : undefined,
            Rated: req.body.Rated,
            Released: req.body.Released,
            Runtime: req.body.Runtime,
            Genre: req.body.Genre,
            Director: req.body.Director,
            Writer: req.body.Writer,
            Actors: req.body.Actors,
            Plot: req.body.Plot,
            Language: req.body.Language,
            Country: req.body.Country,
            Awards: req.body.Awards,
            Poster: req.body.Poster,
            Ratings: req.body.Ratings,
            Metascore: req.body.Metascore ? Number(req.body.Metascore) : undefined,
            imdbRating: req.body.imdbRating ? Number(req.body.imdbRating) : undefined,
            imdbVotes: req.body.imdbVotes,
            imdbID: req.body.imdbID,
            Type: req.body.Type,
            tomatoMeter: req.body.tomatoMeter,
            tomatoImage: req.body.tomatoImage,
            tomatoRating: req.body.tomatoRating,
            tomatoReviews: req.body.tomatoReviews,
            tomatoFresh: req.body.tomatoFresh,
            tomatoRotten: req.body.tomatoRotten,
            tomatoConsensus: req.body.tomatoConsensus,
            tomatoUserMeter: req.body.tomatoUserMeter,
            tomatoUserRating: req.body.tomatoUserRating,
            tomatoUserReviews: req.body.tomatoUserReviews,
            tomatoURL: req.body.tomatoURL,
            DVD: req.body.DVD,
            BoxOffice: req.body.BoxOffice,
            Production: req.body.Production,
            Website: req.body.Website,
            Response: req.body.Response
        });

        res.redirect('/movies');
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.get('/movies/edit/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).lean();
        if (!movie) return res.status(404).send('Movie not found');
        res.render('editMovies', { title: 'Edit Movie', movie });
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Put or update movie
app.put('/movies/:id', async (req, res) => {
    let id = req.params.id
    console.log(req.body)
    try {
        const { Title, Released } = req.body

        let searchCondition
        if (mongoose.Types.ObjectId.isValid(id))
            searchCondition = { _id: id }
        else
            searchCondition = { Movie_ID: Number(id) }


        const update = await Movie.findOneAndUpdate(
            searchCondition,
            { Title, Released },
            { new: true }
        )

        if (!update)
            res.status(500).json({ message: "Movie not found" })

        res.json({
            message: "Movie update successfully",
            movie: update
        })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Delete movie
app.delete('/movies/:id', async (req, res) => {
    try {
        let id = req.params.id

        let searchCondition
        if (mongoose.Types.ObjectId.isValid(id))
            searchCondition = { _id: id }
        else
            searchCondition = { Movie_ID: Number(id) }

        const deleted = await Movie.findOneAndDelete(searchCondition)

        if (!deleted)
            res.status(500).json({ message: "Movie not found" })

        // res.json({ message: "Movie deleted successfully" })
        res.redirect('/movies');
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Starts the server and listen on the specified port
// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
// });

module.exports = app;