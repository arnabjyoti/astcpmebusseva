module.exports = (sequelize, DataTypes) => {
  return sequelize.define("TripLog", {
    date: DataTypes.DATEONLY,
    vehicle_on_road: DataTypes.STRING,
    timesheet_no: DataTypes.STRING,
    route_no: DataTypes.STRING,
    omr_opening_km: DataTypes.FLOAT,
    cmr_closing_km: DataTypes.FLOAT,
    total_km_operated: DataTypes.FLOAT,
    driver_name: DataTypes.STRING,
    conductor_name: DataTypes.STRING,
    no_of_trip: DataTypes.INTEGER,
    total_earning_rs: DataTypes.FLOAT,
    phonepe_b: DataTypes.FLOAT,
    parking_c: DataTypes.FLOAT,
    trip_allowance_rs_d: DataTypes.FLOAT,
    net_amt_deposited: DataTypes.FLOAT,
    net_2: DataTypes.FLOAT,
    amount_to_be_deposited: DataTypes.FLOAT,
    remarks: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active'
    },
  });
};
