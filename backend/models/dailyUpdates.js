'use strict';
module.exports = (sequelize, type) => {
    const dailyUpdates = sequelize.define('dailyUpdates', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        busId: type.STRING,
        date: type.STRING,

        timesheetNo: type.STRING,
        routeNo: type.STRING,
        omr: type.STRING,
        cmr: type.STRING,
        totalOperated: type.STRING,

        osoc: type.STRING,
        csoc: type.STRING,
        consumedSOC: type.STRING,
        targetedTrip: type.STRING,
        currentStatus: type.STRING,
        startTime: type.STRING,
        stopTime: type.STRING,
        driverId: type.STRING,
        conductorId: type.STRING,



        chaloMachineNo: type.STRING,
        noOfTrip: type.STRING,
        wayBillNo: type.STRING,
        challanDeposited: type.STRING,
        walletCard: type.STRING,
        mobilePass: type.STRING,
        studentMpass: type.STRING,
        scanPay: type.STRING,
        unprintedTiciket: type.STRING,
        cardRecharge: type.STRING,
        phonePe: type.STRING,
        basisthaParking: type.STRING,
        tripAllowance: type.STRING,
        netAmountDeposited: type.STRING,
        tragetedEarning: type.STRING,
        amountToBeDeposited: type.STRING,
        remarks: type.STRING,
        status: type.STRING
        
    }, {});
    dailyUpdates.associate = function(models) {
        // associations can be defined here
        // dailyUpdates.hasMany(models.trip);
    };
    return dailyUpdates;
};