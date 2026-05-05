'use strict';

module.exports = (sequelize, type) => {
    const busBreakdown = sequelize.define('busBreakdown', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        dailyUpdateId: type.INTEGER,
        busId: type.INTEGER,
        routeNo: type.STRING,
        driverId: type.INTEGER,
        conductorId: type.INTEGER,
        tripCompleted: type.STRING,
        kmDriven: type.STRING,
        kmAtBreakdown: type.STRING,
        lossKm: type.STRING,
        placeOfBreakdown: type.STRING,
        causeOfBreakdown: type.STRING,
        breakdownDate: type.STRING,
        breakdownTime: type.STRING,
        currentStatus: type.STRING,
        idleDate: type.STRING,
        remarks: type.STRING,
        status: type.STRING
    }, {});

    busBreakdown.associate = function (models) {
        busBreakdown.belongsTo(models.dailyUpdates, {
            foreignKey: 'dailyUpdateId',
            targetKey: 'id',
            as: 'dailyUpdate'
        });

        busBreakdown.belongsTo(models.busMaster, {
            foreignKey: 'busId',
            targetKey: 'id',
            as: 'bus'
        });

        busBreakdown.belongsTo(models.driverMaster, {
            foreignKey: 'driverId',
            targetKey: 'id',
            as: 'driver'
        });

        busBreakdown.belongsTo(models.conductorMaster, {
            foreignKey: 'conductorId',
            targetKey: 'id',
            as: 'conductor'
        });
    };

    return busBreakdown;
};
