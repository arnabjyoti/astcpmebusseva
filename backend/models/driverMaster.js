'use strict';
module.exports = (sequelize, type) => {
    const driverMaster = sequelize.define('driverMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        driver_id: type.STRING(255),
        driver_name: type.STRING,
        license_no: type.STRING,
        license_validity: type.STRING,
        contact_no: type.STRING,
        aadhar: type.STRING,
        pan: type.STRING,
        voter: type.STRING,
        address: type.STRING,
        photo: type.STRING,
        status: type.STRING
    }, { timestamps: true });
    driverMaster.associate = function (models) {
        // associations can be defined here
        // busMaster.hasMany(models.trip);
        driverMaster.hasMany(models.dailyUpdates, {
            foreignKey: "driverId",
            as: "dailyUpdates"
        });

        driverMaster.hasMany(models.busBreakdown, {
            foreignKey: "driverId",
            as: "breakdowns"
        });

    };
    return driverMaster;
};
