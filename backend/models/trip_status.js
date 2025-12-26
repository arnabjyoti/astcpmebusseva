'use strict';
module.exports = (sequelize, type) => {
    const trip_status = sequelize.define('trip_status', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // trip_id: type.INTEGER,
        station : type.STRING,
        std: type.STRING,
        etd : type.STRING,
        gate : type.STRING,
        status : type.STRING,
        next_stop : type.STRING,
        date: type.STRING,
        travel_id: type.INTEGER,
      
    }, {
        timestamps: true, 
    });
    trip_status.associate = function(models) {
        // associations can be defined here
        trip_status.belongsTo(models.trip);
    };
    return trip_status;
};


