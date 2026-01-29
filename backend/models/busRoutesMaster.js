'use strict';

const { route } = require("../app");

module.exports = (sequelize, type) => {
    const busRoutesMaster = sequelize.define('busRoutesMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        depot: type.STRING,
        start: type.STRING,
        end: type.STRING,
        via: type.STRING,
        routeNo: type.STRING,
        routeName: type.STRING,
        routeDistance: type.STRING,
        depot_to_start_distance: type.STRING,
        end_to_depot_distance: type.STRING,
        estimated_collection: type.STRING,
        status: type.STRING
    }, { timestamps: true });
    busRoutesMaster.associate = function (models) {
        // associations can be defined here
        // busMaster.hasMany(models.trip);
        busRoutesMaster.hasMany(models.dailyUpdates, {
            foreignKey: "routeNo",
            // sourceKey: "id",
            as: "dailyUpdates"
        });

    };
    return busRoutesMaster;
};