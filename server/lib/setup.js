'use strict';

var inquirer = require('inquirer');
var assert = require('assert');
var async = require('async');
var chalk = require('chalk');

var app = require('../server');
var loopback = app.loopback;

var User = loopback.getModel('User');
var Role = loopback.getModel('Role');
var RoleMapping = loopback.getModel('RoleMapping');

var questions = [
    {
        type: 'list',
        message: 'Select setup action',
        name: 'action',
        choices: [{
            name: 'Add sample users',
            value: 'addSample',
            checked: true
        }, {
            name: 'Create new User(s)',
            value: 'createUser',
            checked: true
        }, {
            name: 'Flush selected Models',
            value: 'flushSelectedModels'
        }, {
            name: 'Flush all Models',
            value: 'flushAllModels'
        }]
    }, {
        type: 'input',
        name: 'addCount',
        message: 'How many Users would you like to add?',
        default: 1,
        validate: function (value) {
            var isInt =  (!isNaN(+value) && (Math.floor(+value) === Math.ceil(+value))) && value > 0;
            return (isInt) ? true : 'Please input an interger value greater than 0.';
        },
        when: function (answers) {
            return answers.action === 'createUser';
        }
    }, {
        type: 'checkbox',
        name: 'flushModels',
        message: 'Select models to flush:',
        choices: getModelNames(),
        validate: function (value) {
            return value.length ? true : false;
        },
        when: function (answers) {
            return answers.action === 'flushSelectedModels';
        }
    }, {
        type: 'confirm',
        name: 'flushSelectedModelsConfirm',
        message: 'Are you sure you want to flush all data from the selected Models?',
        when: function (answers) {
            return answers.action === 'flushSelectedModels';
        }
    }, {
        type: 'confirm',
        name: 'flushAllModelsConfirm',
        message: 'Are you sure you want to flush all Models?',
        when: function (answers) {
            return answers.action === 'flushAllModels';
        }
    }
];

inquirer.prompt(questions, function (answers) {
    if (answers.action === 'addSample') {
        addSampleUsers(answers.addCount);
    } else if (answers.action === 'createUser') {
        addUsers(answers.addCount);
    } else if (answers.action === 'flushSelectedModels' && answers.flushSelectedModelsConfirm) {
        flushModels(answers.flushModels);
    } else if (answers.action === 'flushAllModels' && answers.flushAllModelsConfirm) {
        flushModels();
    } else {
        console.info(chalk.gray('[info]'), 'You have managed to perform none of the setup tasks, hats off to you!');
    }
});

function addSampleUsers() {
    async.series([
        function (cb) {
            User.create({
                username: 'user',
                password: 'asdf',
                email: 'user@sample-email.com',
                firstName: 'Average',
                lastName: 'User',
                emailVerified: 1
            }, function (err) {
                assert(!err, 'Failre in creating user Average User');
                console.info(chalk.gray('[info]'), 'Average User created successfully.', '\n');
                cb(null, true);
            });
        },
        function (cb) {
            User.create({
                username: 'admin',
                password: 'asdf',
                email: 'admin@sample-email.com',
                firstName: 'Admin',
                lastName: 'User',
                emailVerified: 1
            }, function (err, user) {
                assert(!err, 'Failre in creating user Admin User');
                Role.findOrCreate({
                    // query for find
                    where: { name: 'admin' }
                }, {
                    // if not found, create with these properties
                    name: 'admin'
                }, function (err, role) {
                    assert(!err, 'Failre in finding or creating admin role.');
                    role.principals.create({
                        principalType: RoleMapping.USER,
                        principalId: user.id
                    }, function (err) {
                        assert(!err, 'Failre in assigning admin role to Admin User');
                        console.info(chalk.gray('[info]'), 'Admin User created successfully.', '\n');
                        cb(null, true);
                    });
                });
            });
        }
    ], function seriesCallback(err) {
        assert(!err, 'Failre creating sample users');
        process.exit();
    });
}

function addUsers(count) {
    var promises = [];

    for (var i = 0; i < count; i++) {
        promises.push(addUser(i + 1));
    }

    async.series(
        promises,
        function seriesCallback(err) {
            assert(!err, 'Failre creating users');
            process.exit();
        }
    );
}

function addUser(num) {
    var username = (num > 1) ? 'user' + num : 'user';
    var userQuestions = [
        {
            type: 'text',
            name: 'username',
            default: username,
            message: 'username'
        }, {
            type: 'text',
            name: 'password',
            default: 'password',
            message: 'password'
        }, {
            type: 'text',
            name: 'email',
            default: username + '@sample-email.com',
            message: 'email'
        }, {
            type: 'text',
            name: 'firstName',
            default: 'John',
            message: 'first name'
        }, {
            type: 'text',
            name: 'lastName',
            default: 'Doe',
            message: 'last name'
        }, {
            type: 'confirm',
            name: 'emailVerified',
            message: 'email verified'
        }, {
            type: 'confirm',
            name: 'isAdmin',
            default: false,
            message: 'is admin'
        }
    ];
    return function (cb) {
        console.info(chalk.gray('\n[info]'), 'Please complete the follwoing information to create a new user.');
        inquirer.prompt(userQuestions, function (answers) {
            answers.emailVerified = (answers.emailVerified) ? 1 : 0;

            var isAdmin = answers.isAdmin;
            delete answers.isAdmin;

            User.create(answers, function (err, user) {
                assert(!err, 'Failre in creating user' + answers.username);
                if (isAdmin) {
                    Role.findOrCreate({
                        // query for find
                        where: { name: 'admin' }
                    }, {
                        // if not found, create with these properties
                        name: 'admin'
                    }, function (err, role) {
                        assert(!err, 'Failre in finding or creating admin role.');
                        role.principals.create({
                            principalType: RoleMapping.USER,
                            principalId: user.id
                        }, function (err) {
                            assert(!err, 'Failre in assigning admin role to ' + answers.username);
                            console.info(chalk.gray('[info]'), 'Admin user ' + answers.username + ' created successfully.', '\n');
                            cb(null, true);
                        });
                    });
                } else {
                    console.info(chalk.gray('[info]'), 'User ' + answers.username + ' created successfully.', '\n');
                    cb(null, true);
                }
            });
        });
    };
}

function getModelNames() {
    var modelNames = [];
    app.models().forEach(function (Model) {
        modelNames.push(Model.modelName);
    });
    return modelNames;
}

function flushModels(modelNames) {
    modelNames = modelNames || getModelNames();
    var Model;

    modelNames.forEach(function (modelName) {
        Model = loopback.getModel(modelName);
        Model.deleteAll(function (err) {
            assert(!err, 'Failre in flushing data from ' + modelName);
            console.info(chalk.gray('[info]'), 'Data successfully flushed from:', modelName);
            process.exit();
        });
    });
}
