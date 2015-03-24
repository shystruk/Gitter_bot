/**
 * Created by v.stokolosa on 3/23/15.
 */
/*jshint globalstrict:true, trailing:false, unused:true, node:true */

'use strict';

var express = require('express');
var app = express();

var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2');
var request = require('request');
var Gitter = require('node-gitter');

var gitterHost    = process.env.HOST || 'https://gitter.im';
var port          = process.env.PORT || 3000;

// Client OAuth configuration
var clientId      = process.env.GITTER_KEY;
var clientSecret  = process.env.GITTER_SECRET;

// room which would be scanned by BOT
var room = process.env.ROOM;

// Gitter API client helper
var gitterAuthen = {
    fetch: function(path, token, cb) {
        var options = {
            url: gitterHost + path,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };

        request(options, function (err, res, body) {
            if (err) return cb(err);

            if (res.statusCode === 200) {
                cb(null, JSON.parse(body));
            } else {
                cb('err' + res.statusCode);
            }
        });
    },

    fetchCurrentUser: function(token, cb) {
        this.fetch('/api/v1/user/', token, function(err, user) {
            cb(err, user[0]);
        });
    },

    fetchRooms: function(user, token, cb) {
        this.fetch('/api/v1/user/' + user.id + '/rooms', token, function(err, rooms) {
            cb(err, rooms);
        });
    }
};

// Middlewares
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static( __dirname + '/public'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'keyboard cat'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

// Passport Configuration
passport.use(new OAuth2Strategy({
        authorizationURL:   gitterHost + '/login/oauth/authorize',
        tokenURL:           gitterHost + '/login/oauth/token',
        clientID:           clientId,
        clientSecret:       clientSecret,
        callbackURL:        '/login/callback',
        passReqToCallback:  true
    },
    function(req, accessToken, refreshToken, profile, done) {
        req.session.token = accessToken;
        gitterAuthen.fetchCurrentUser(accessToken, function(err, user) {
            return (err ? done(err) : done(null, user));
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, JSON.stringify(user));
});

passport.deserializeUser(function (user, done) {
    done(null, JSON.parse(user));
});

//routes
app.get('/login',
    passport.authenticate('oauth2')
);

app.get('/login/callback',
    passport.authenticate('oauth2', {
        successRedirect: '/home',
        failureRedirect: '/'
    })
);

app.get('/logout', function(req,res) {
    req.session.destroy();
    res.redirect('/');
});


app.get('/', function(req, res) {
    res.render('landing');
});


app.get('/home', function(req, res) {
    if (!req.user) return res.redirect('/');


    // Fetch user rooms using the Gitter API
    gitterAuthen.fetchRooms(req.user, req.session.token, function(err, rooms) {
        if (err) return res.send(500);

        res.render('home', {
            user: req.user,
            token: req.session.token,
            clientId: clientId,
            rooms: rooms,
            room: room
        });
    });

    //scanning room
    var gitter = new Gitter(req.session.token),
        events,
        messageCurrent,
        posCalc,
        calcData,
        result;

    gitter.currentUser()
        .then(function(user) {
            console.log('You are logged in as:', user.username);
        });

    gitter.rooms.join(room).then(function(room) {
        events = room.listen();

        events.on('message', function(message) {
            messageCurrent = message.text;

            if (messageCurrent.indexOf('calc ') > -1) {
                posCalc = messageCurrent.indexOf('calc ');
                calcData = messageCurrent.slice(posCalc + 4, messageCurrent.length);
                result = eval(calcData);

                room.send(calcData + ' = ' + result);
            }
        });
    });
});

//server
app.listen(port);
console.log('BOT running at http://localhost:' + port + ' and would be scanned room ' + room);
