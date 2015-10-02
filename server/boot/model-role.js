'use strict';

var assert = require('assert');

module.exports = function(app) {
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    Role.ADMIN = 'admin';

    Role.findOrCreate({
        // query for find
        where: {
            name: Role.ADMIN
        }
    }, {
        // if not found, create with these properties
        name: Role.ADMIN
    }, function (err, role) {
        assert.ifError(err);
    });

    // register a resolver, used by Role.getRoles and Role.isInRole
    Role.registerResolver('admin', function (name, ctx, callback) {

        // name = role name, aka 'admin';
        var userId = ctx.getUserId();
        if (!ctx || !userId) {
            process.nextTick(function() {
                return callback && callback(null, false);
            });
            return;
        }
        // fine the admin role, we need the id
        Role.find({ where: { name: name } }, function (err, role) {
            if (err || !role.length) {
                return callback && callback(err, false);
            }
            // see if the user in context has a mapping to the admin role
            RoleMapping.find({ where: { roleId: role.id, principalId: userId } }, function (err, mapping) {
                if (err || !mapping.length) {
                    return callback && callback(err, false);
                }
                return callback && callback(null, true);
            });
        });
    });
};
