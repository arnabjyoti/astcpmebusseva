'use strict';
module.exports = (sequelize, type) => {
    const busRoutesMaster = sequelize.define('busRoutesMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        routeName: type.STRING,
        routeNo: type.STRING,
        status: type.STRING
    }, {timestamps:true});
    busRoutesMaster.associate = function(models) {
        // associations can be defined here
        // busMaster.hasMany(models.trip);
    };
    return busRoutesMaster;
};