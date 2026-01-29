'use strict';
module.exports = (sequelize, type) => {
    const conductorMaster = sequelize.define('conductorMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conductor_id: type.STRING,
        conductor_name: type.STRING,
        contact_no: type.STRING,
        aadhaar: type.STRING,
        pan: type.STRING,
        voter: type.STRING,
        dl: type.STRING,
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

    };
    return conductorMaster;
};