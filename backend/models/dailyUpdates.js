'use strict';
module.exports = (sequelize, type) => {
    const dailyUpdates = sequelize.define('dailyUpdates', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        busId: type.INTEGER,
        date: type.STRING,

        timesheetNo: type.STRING,
        routeNo: type.STRING,
        omr: type.STRING,
        cmr: type.STRING,
        totalOperated: type.STRING,
        totalOperatedAtBreakdown: type.STRING,

        osoc: type.STRING,
        csoc: type.STRING,
        consumedSOC: type.STRING,
        targetedTrip: type.STRING,
        currentStatus: type.STRING,
        startTime: type.STRING,
        stopTime: type.STRING,
        driverId: type.INTEGER,
        conductorId: type.INTEGER,


        chaloTicketNo: type.STRING,
        chaloPassengersNo: type.STRING,
        chaloTicketAmount: type.STRING,
        cashCollection: type.STRING,
        upi: type.STRING,
        additionalAmount: type.STRING,

        chaloWayBillNo: type.STRING,
        chaloMachineNo: type.STRING,
        noOfTrip: type.STRING,

        netAmountDeposited: type.STRING,
        tragetedEarning: type.STRING,
        amountToBeDeposited: type.STRING,
        placeOfBreakdown: type.STRING,
        causeOfBreakdown: type.STRING,
        remarks: type.STRING,
        status: type.STRING

    }, {});
    dailyUpdates.associate = function (models) {
        // associations can be defined here
        // dailyUpdates.hasMany(models.trip);
        dailyUpdates.belongsTo(models.busMaster, {
            foreignKey: "busId",
            targetKey: "id",
            as: "bus"
        });

        dailyUpdates.belongsTo(models.busRoutesMaster, {
            foreignKey: "routeNo",
            targetKey: "routeNo",
            as: "route"
        });

        dailyUpdates.belongsTo(models.driverMaster, {
            foreignKey: "driverId",
            targetKey: "id",
            as: "driver"
        });

        dailyUpdates.belongsTo(models.conductorMaster, {
            foreignKey: "conductorId",
            targetKey: "id",
            as: "conductor"
        });

    };
    return dailyUpdates;
};