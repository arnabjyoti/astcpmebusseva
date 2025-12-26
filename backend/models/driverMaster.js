'use strict';
module.exports = (sequelize, type) => {
    const driverMaster = sequelize.define('driverMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        driver_name: type.STRING,
        contact_no: type.STRING,
        status: type.STRING
    }, {timestamps:true});
    driverMaster.associate = function(models) {
        // associations can be defined here
        // busMaster.hasMany(models.trip);
    };
    return driverMaster;
};