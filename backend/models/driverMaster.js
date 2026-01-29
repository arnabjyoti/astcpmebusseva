'use strict';
module.exports = (sequelize, type) => {
    const driverMaster = sequelize.define('driverMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        driver_id: type.STRING,
        driver_name: type.STRING,
        contact_no: type.STRING,
        aadhaar: type.STRING,
        pan: type.STRING,
        voter: type.STRING,
        dl: type.STRING,
        address: type.STRING,
        photo: type.STRING,
        status: type.STRING
    }, { timestamps: true });
    driverMaster.associate = function (models) {
        // associations can be defined here
        // busMaster.hasMany(models.trip);
        driverMaster.hasMany(models.dailyUpdates, {
            foreignKey: "driverId",
            as: "driverId"
        });

    };
    return driverMaster;
};