'use strict';
module.exports = (sequelize, type) => {
    const stations = sequelize.define('stations', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        trip_id: type.INTEGER,
        name: type.STRING,
        est: type.STRING,
        stop_time: type.STRING,
        gate: type.STRING,

    }, {
        timestamps: true, 
    });
    stations.associate = function(models) {
        // associations can be defined here
        // stations.belongsTo(models.trip);
        // stations.hasMany(models.trip);
    };
    return stations;
};
