'use strict';
module.exports = (sequelize, type) => {
    const trip = sequelize.define('trip', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // bus_id: type.INTEGER,
        trip_name: type.STRING,
        date: type.STRING,
        from: type.STRING,
        to: type.STRING,
        via: type.STRING,
        isActive: type.STRING,

    }, {
        timestamps: true, 
    });
    trip.associate = function(models) {
        // associations can be defined here
        trip.belongsTo(models.busMaster);
        trip.hasMany(models.trip_status);
    };
    return trip;
};
