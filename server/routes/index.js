/**
 * Created by v.stokolosa on 3/25/15.
 */
'use strict';

var Gitter = require('node-gitter');
var server = require('../../server.js');

module.exports = function (app, passport) {

    app.get('/login',
        passport.authenticate('oauth2')
    );

    app.get('/login/callback',
        passport.authenticate('oauth2', {
            successRedirect: '/home',
            failureRedirect: '/'
        })
    );

    app.get('/logout', function(req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    app.get('/', function(req, res) {
        if (req.user) {
            res.redirect('/home');
        } else {
            res.render('landing');
        }
    });

    app.get('/home', function(req, res) {
        var token = req.session.token,
            user = req.user,
            gitter = new Gitter(token),
            messageCurrent,
            events,
            posCalc,
            calcData,
            result;

        if (!user) return res.redirect('/');

        // Fetch user rooms using the Gitter API
        server.gitterAuthen.fetchRooms(user, token, function(err, rooms) {
            if (err) return res.send(500);

            res.render('home', {
                user: user,
                token: token,
                clientId: server.clientId,
                room: server.room,
                rooms: rooms
            });
        });

        if (req.cookies.BotRoom !== server.room) {

            res.clearCookie('BotRoom');
            res.cookie('BotRoom', server.room);

            //scanning room
            gitter.rooms.join(server.room).then(function(room) {
                events = room.listen();

                console.log('BOT is scanning the room: ' + room.name);

                events.on('message', function(message) {
                    messageCurrent = message.text;
                    posCalc = messageCurrent.indexOf('calc ');

                    if (posCalc > -1) {
                        calcData = messageCurrent.slice(posCalc + 4, messageCurrent.length);
                        try {
                            result = eval(calcData);
                            room.send(calcData + ' = ' + result);
                        } catch(err) {
                            room.send(calcData + ' = ' +
                                'Sorry, BOT can\'t count your expression! Incorrect characters. Try again! ;)');
                        }
                    }
                });
            });
        }
    });
};
