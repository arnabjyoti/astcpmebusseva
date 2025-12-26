const TripLogModel = require("../models").TripLog;
const { Op } = require("sequelize");

module.exports = {
  async getFilteredTripLogs(req, res) {
    try {
      const requestData = req.body.requestObject;

      const startDate = requestData.startDate;
      const endDate = requestData.endDate;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required." });
      }

      const tripLogs = await TripLogModel.findAll({
        where: {
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["date", "ASC"]],
      });

      return res.status(200).json(tripLogs);
    } catch (error) {
      console.error("Error in getFilteredTripLogs:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  },



  async createTripLog(req, res) {
    try {
    const trips = req.body.requestObject; // this is an array

    if (!Array.isArray(trips) || trips.length === 0) {
      return res.status(400).json({ error: "❌ No trip data provided." });
    }

    const requiredFields = [
      "date",
      "vehicle",
      "timesheet",
      "route",
      "omrOpen",
      "cmrClose",
      "trips",
      "driver",
      "conductor",
      "earning",
      "phonepe",
      "parking",
      "allowance",
    ];

    const savedTrips = [];

    for (const tripData of trips) {
      // validate required fields
      for (const field of requiredFields) {
        if (!tripData[field] && tripData[field] !== 0) {
          return res.status(400).json({ error: `❌ ${field} is required.` });
        }
      }

      const newTrip = await TripLogModel.create({
        date: tripData.date,
        vehicle_on_road: tripData.vehicle,
        timesheet_no: tripData.timesheet,
        route_no: tripData.route,
        omr_opening_km: tripData.omrOpen,
        cmr_closing_km: tripData.cmrClose,
        total_km_operated: tripData.totalKm,
        driver_name: tripData.driver,
        conductor_name: tripData.conductor,
        no_of_trip: tripData.trips,
        total_earning_rs: tripData.earning,
        phonepe_b: tripData.phonepe,
        parking_c: tripData.parking,
        trip_allowance_rs_d: tripData.allowance,
        net_amt_deposited: tripData.netDeposit,
        net_2: tripData.netEarning,
      });

      savedTrips.push(newTrip);
    }

    return res.status(201).json({
      message: "✅ Trip logs saved successfully.",
      data: savedTrips,
    });
  } catch (error) {
    console.error("Error in createTripLog:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
},
};
