const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'))

// Knex Setup
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);

// bcrypt setup
let bcrypt = require('bcrypt');
const saltRounds = 10;

// jwt setup
const jwt = require('jsonwebtoken');
let jwtSecret = process.env.jwtSecret;
if (jwtSecret === undefined) {
    console.log("You need to define a jwtSecret environment variable to continue.");
    knex.destroy();
    process.exit();
}

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token)
        return res.status(403).send({ error: 'No token provided.' });
    jwt.verify(token, jwtSecret, function(err, decoded) {
        if (err)
            return res.status(500).send({ error: 'Failed to authenticate token.' });
        // if everything good, save to request for use in other routes
        req.userID = decoded.id;
        next();
    });
}


//Login User
app.post('/api/login', (req, res) => {
    if (!req.body.username || !req.body.password){
      return res.status(400).send();
    }

    knex('users').where('username',req.body.username).first().then(user => {
         if (user === undefined) {
             res.status(403).send("Invalid credentials");
             throw new Error('abort');
         }
         return [bcrypt.compare(req.body.password, user.hash),user];

    }).spread((result,user) => {
        if (result) {
            let token = jwt.sign({ id: user.id }, jwtSecret, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).json({user: {username: user.username, name: user.name,
                    id: user.id, numberCorrect: user.numberCorrect, drinkIndex: user.drinkIndex}});
        }
        else{
            res.status(403).send("Invalid credentials");
        }
        return;

    }).catch(error => {
        if (error.message !== 'abort') {
            console.log(error);
            res.status(500).json({ error });
        }
    });
});

/*
app.post('/api/credentials/get', (req, res) => {
    let myUsername = req.body.username;
    let password = "";
    let guessedDrinks = [];
    let foundUsername = false;
    let answerCounter = 0;
    for (let i = 0; i < credentials.length; ++i){
        if (credentials[i].username === myUsername){
            foundUsername = true;
            guessedDrinks = credentials[i].guessedDrinks;
            password = credentials[i].password;
            answerCounter = credentials[i].answerCounter;
            break;
        }
    }

    let credential = {username: myUsername, password: password, guessedDrinks: guessedDrinks,
        answerCounter: answerCounter};

    res.send({credential: credential, foundUsername: foundUsername});
});
*/


//Register User
app.post('/api/register', (req, res) => {
    if (!req.body.password || !req.body.username || !req.body.name){
        return res.status(400).send();
    }

    knex('users').where('username',req.body.username).first().then(user => {
        if (user !== undefined) {
            res.status(403).send("Username already exists");
            throw new Error('abort');
        }
        return bcrypt.hash(req.body.password, saltRounds);

    }).then(hash => {
        return knex('users').insert({hash: hash, username:req.body.username,
            name:req.body.name, numberCorrect: 0, drinkIndex: 0});

    }).then(ids => {
        return knex('users').where('id',ids[0]).first().select('username','name','id', 'numberCorrect', 'drinkIndex');

    }).then(user => {
    let token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).json({user:user,token:token});
        return;

    }).catch(error => {
    if (error.message !== 'abort') {
    console.log(error);
    res.status(500).json({ error });
}
});
});


app.get('/api/user/:id/drinkIndex', (req, res) => {
    let id = parseInt(req.params.id);
    knex('users').where('id',id).first()
    .select('numberCorrect','drinkIndex').then(user => {
        res.status(200).json({user: user});
    }).catch(error => {
        console.log(error);
        res.status(500).json({ error });
    });
});


app.post('/api/user/:id/incrementIndex', (req, res) => {
    let id = parseInt(req.params.id);
    let drinkIndex = req.body.drinkIndex;
    let numberCorrect = req.body.numberCorrect;
    if(drinkIndex === undefined){
        console.log("drinkIndex is null");
        res.status(400).send();
    }
    if(numberCorrect === undefined){
        console.log("numberCorrect is null");
        res.status(400).send();
    }

    knex('users').where('id',id)
    .update({
        drinkIndex: drinkIndex,
        numberCorrect: numberCorrect
    }).then(result => {
        res.status(200).send();
    }).catch(error => {
        console.log(error);
        res.status(500).json({ error }).send();
    });
});


/*app.get('/api/credentials', (req, res) => {
    res.send(credentials);
});*/

/*app.post('/api/credentials', (req, res) => {
    let answerCounter = 0;
    let credential = {username: req.body.username, password: req.body.password, guessedDrinks: req.body.guessedDrinks,
        answerCounter: answerCounter};
    credentials.push(credential);
    res.send({credential: credential});
    console.log("done son");
});*/

/*app.put('/api/credentials/:username', (req, res) => {
    let myUsername = req.body.username;

    let foundUsername = false;
    for (let i = 0; i < credentials.length; ++i){
        if (credentials[i].username === myUsername){
            credentials[i].guessedDrinks = req.body.guessedDrinks;
            credentials[i].answerCounter = req.body.answerCounter;
            console.log(req.body.answerCounter + ", " + credentials[i].answerCounter);
            foundUsername = true;
            break;
        }
    }

  res.send(foundUsername);
});*/

app.delete('/api/user/:id', (req, res) => {
    let id = parseInt(req.params.id);

    knex('users').where('id', id).first().select().then(user => {
        if (user === undefined) {
            res.status(403).send("Invalid credentials");
            throw new Error('abort');
        }})
    knex('users')
        .where('id', id)
        .del()
        .then(user => {
        res.sendStatus(200);
        }).catch(error => {
        console.log("error: we be in the delete function");
        res.status(500).json({ error });

});
});

app.listen(5050, () => console.log('Server listening on port 5050!'))