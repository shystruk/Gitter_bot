/**
 * Created by v.stokolosa on 3/25/15.
 */
'use strict';

var passport = require('passport');
var Gitter = require('node-gitter');
var server = require('../../server.js');

module.exports = function (app) {

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
        server.gitterAuthen.fetchRooms(req.user, req.session.token, function(err, rooms) {
            if (err) return res.send(500);

            res.render('home', {
                user: req.user,
                token: req.session.token,
                clientId: server.clientId,
                rooms: rooms,
                room: server.room
            });
        });

        //scanning room
        var gitter = new Gitter(req.session.token),
            events,
            messageCurrent,
            posCalc,
            calcData,
            result;

        gitter.currentUser().then(function(user) {
            console.log('You are logged in as:', user.username);
        });

        gitter.rooms.join(server.room).then(function(room) {
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
};
