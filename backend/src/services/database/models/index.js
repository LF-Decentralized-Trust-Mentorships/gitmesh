"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var sequelize_1 = __importStar(require("sequelize"));
/**
 * This module creates the Sequelize to the database and
 * exports all the models.
 */
var logging_1 = require("@gitmesh/logging");
var conf_1 = require("../../conf");
var configTypes = __importStar(require("../../conf/configTypes"));
var highlight = require('cli-highlight').highlight;
var log = (0, logging_1.getServiceChildLogger)('Database');
function getCredentials() {
    if (conf_1.DB_CONFIG.username) {
        return {
            username: conf_1.DB_CONFIG.username,
            password: conf_1.DB_CONFIG.password
        };
    }
    switch (conf_1.SERVICE) {
        case configTypes.ServiceType.API:
            return {
                username: conf_1.DB_CONFIG.apiUsername,
                password: conf_1.DB_CONFIG.apiPassword
            };
        case configTypes.ServiceType.JOB_GENERATOR:
            return {
                username: conf_1.DB_CONFIG.jobGeneratorUsername,
                password: conf_1.DB_CONFIG.jobGeneratorPassword
            };
        case configTypes.ServiceType.NODEJS_WORKER:
            return {
                username: conf_1.DB_CONFIG.nodejsWorkerUsername,
                password: conf_1.DB_CONFIG.nodejsWorkerPassword
            };
        default:
            throw new Error('Incorrectly configured database connection settings!');
    }
}
function models(queryTimeoutMilliseconds) {
    var database = {};
    var credentials = getCredentials();
    var sequelize = new sequelize_1["default"](conf_1.DB_CONFIG.database, credentials.username, credentials.password, {
        dialect: conf_1.DB_CONFIG.dialect,
        dialectOptions: {
            application_name: conf_1.SERVICE,
            connectionTimeoutMillis: 5000,
            query_timeout: queryTimeoutMilliseconds,
            idle_in_transaction_session_timeout: 10000
        },
        port: conf_1.DB_CONFIG.port,
        replication: {
            read: [
                {
                    host: conf_1.SERVICE === configTypes.ServiceType.API ? conf_1.DB_CONFIG.readHost : conf_1.DB_CONFIG.writeHost
                },
            ],
            write: { host: conf_1.DB_CONFIG.writeHost }
        },
        pool: {
            max: conf_1.SERVICE === configTypes.ServiceType.API ? 20 : 10,
            min: 0,
            acquire: 50000,
            idle: 10000
        },
        logging: conf_1.DB_CONFIG.logging
            ? function (dbLog) {
                return log.info(highlight(dbLog, {
                    language: 'sql',
                    ignoreIllegals: true
                }), 'DB LOG');
            }
            : false
    });
    var modelClasses = [
        require('./activity')["default"],
        require('./auditLog')["default"],
        require('./member')["default"],
        require('./memberIdentity')["default"],
        require('./file')["default"],
        require('./integration')["default"],
        require('./report')["default"],
        require('./settings')["default"],
        require('./tag')["default"],
        require('./tenant')["default"],
        require('./tenantUser')["default"],
        require('./user')["default"],
        require('./widget')["default"],
        require('./microservice')["default"],
        require('./conversation')["default"],
        require('./conversationSettings')["default"],
        require('./signalsContent')["default"],
        require('./signalsAction')["default"],
        require('./automation')["default"],
        require('./automationExecution')["default"],
        require('./organization')["default"],
        require('./organizationCache')["default"],
        require('./memberAttributeSettings')["default"],
        require('./task')["default"],
        require('./note')["default"],
        require('./memberActivityAggregatesMV')["default"],
        require('./segment')["default"],
        require('./customView')["default"],
        require('./customViewOrder')["default"],
    ];
    for (var _i = 0, modelClasses_1 = modelClasses; _i < modelClasses_1.length; _i++) {
        var notInitmodel = modelClasses_1[_i];
        var model = notInitmodel(sequelize, sequelize_1.DataTypes);
        database[model.name] = model;
    }
    Object.keys(database).forEach(function (modelName) {
        if (database[modelName].associate) {
            database[modelName].associate(database);
        }
    });
    database.sequelize = sequelize;
    database.Sequelize = sequelize_1["default"];
    return database;
}
exports["default"] = models;
