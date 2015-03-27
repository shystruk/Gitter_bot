/**
 * Created by v.stokolosa on 3/26/15.
 */

'use strict';

var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2');
var server = require('../../server.js');

// Gitter API client helper
module.exports = function () {

    // Passport Configuration
    passport.use(new OAuth2Strategy({
            authorizationURL:   server.gitterHost + '/login/oauth/authorize',
            tokenURL:           server.gitterHost + '/login/oauth/token',
            clientID:           server.clientId,
            clientSecret:       server.clientSecret,
            callbackURL:        '/login/callback',
            passReqToCallback:  true
        },
        function(req, accessToken, refreshToken, profile, done) {
            req.session.token = accessToken;
            server.gitterAuthen.fetchCurrentUser(accessToken, function(err, user) {
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
};
