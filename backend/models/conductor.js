'use strict';
module.exports = (sequelize, type) => {
    const conductorMaster = sequelize.define('conductorMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conductor_id: type.STRING(255),
        conductor_name: type.STRING,
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
    conductorMaster.associate = function (models) {
        // associations can be defined here
        // busMaster.hasMany(models.trip);
        conductorMaster.hasMany(models.dailyUpdates, {
            foreignKey: "conductorId",
            as: "dailyUpdates"
        });

        conductorMaster.hasMany(models.busBreakdown, {
            foreignKey: "conductorId",
            as: "breakdowns"
        });

    };
    return conductorMaster;
};
