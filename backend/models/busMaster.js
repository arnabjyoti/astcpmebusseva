'use strict';
module.exports = (sequelize, type) => {
    const busMaster = sequelize.define('busMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        busName: type.STRING,
        busNo: type.STRING,
        driverId: type.STRING,
        conductorId: type.STRING,
        driverName: type.STRING,
        driverContactNo: type.STRING,
        conductorName: type.STRING,
        conductorContactNo: type.STRING,
        baseDepot: type.STRING,
        allotedRouteNo: type.STRING,
        status: type.STRING
        

        
    }, {});
    busMaster.associate = function(models) {
        // associations can be defined here
        // busMaster.hasMany(models.trip);
    };
    return busMaster;
};