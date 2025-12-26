'use strict';
module.exports = (sequelize, type) => {
    const conductorMaster = sequelize.define('conductorMaster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conductor_name: type.STRING,
        contact_no: type.STRING,
        status: type.STRING
    }, {timestamps:true});
    conductorMaster.associate = function(models) {
        // associations can be defined here
        // busMaster.hasMany(models.trip);
    };
    return conductorMaster;
};