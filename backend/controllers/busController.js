const async = require("async");
const usersModel = require("../models").users;
const rolePrivilegeModel = require("../models").roles;
const privilegeModel = require("../models").privilege;
const brunchMasterModel = require("../models").brunchMaster;
const brunchModel = require("../models").brunch;
const bcrypt = require("bcrypt");
var request = require("request");
const Op = require("sequelize").Op;
const { Sequelize, fn, literal } = require("sequelize");
const busModel = require("../models").busMaster;
const busRoutesModel = require("../models").busRoutesMaster;
const busMasterModel = require("../models").busMaster;
const driverMasterModel = require("../models").driverMaster;
const conductorMasterModel = require("../models").conductorMaster;
const dailyUpdatesModel = require("../models").dailyUpdates;
const tripModel = require("../models").trip;
const trip_statusModel = require("../models").trip_status;
const stationsModel = require("../models").stations;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
// const { Sequelize, Model } = require('sequelize');
const { sequelize } = require("../models");
const { log } = require("console");
const conductor = require("../models/conductor");
const e = require("express");

module.exports = {
  upload_driver_image: multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const dest = path.join(config.FILE_UPLOAD_PATH, "image", "driver");
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        cb(null, "driver_" + Date.now() + path.extname(file.originalname));
      },
    }),
  }),

  upload_conductor_image: multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const dest = path.join(config.FILE_UPLOAD_PATH, "image", "conductor");
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        cb(null, "conductor_" + Date.now() + path.extname(file.originalname));
      },
    }),
  }),

  createBus(req, res) {
    let requestObject = req.body.requestObject;
    requestObject.status = "Active";
    console.log("requestObject= ", requestObject);
    busModel
      .create(req.body.requestObject)
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  updateBus(req, res) {
    let data = req.body.requestObject;
    busModel
      .update(
        {
          busName: data?.busName,
          busNo: data?.busNo,
          driverName: data?.driverName,
          driverId: data?.driverId,
          driverContactNo: data?.driverContactNo,
          conductorName: data?.conductorName,
          conductorId: data?.conductorId,
          conductorContactNo: data?.conductorContactNo,
          baseDepot: data?.baseDepot,
          allotedRouteNo: data?.allotedRouteNo,
        },
        { where: { id: data.id } }
      )
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  deleteBus(req, res) {
    let data = req.body.requestObject;
    busModel
      .update(
        {
          status: "Inactive",
        },
        { where: { id: data.id } }
      )
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  getBusRoutes(req, res) {
    let query = {
      // where: {
      //   status: "Active",
      // },
      raw: true,
      order: [["id", "DESC"]],
    };

    return busRoutesModel
      .findAll(query)
      .then((routes) => {
        return res.status(200).send(routes);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  async createBusRoutes(req, res) {
    try {
      let data = req.body.requestObject;

      // Capitalize first letter utility
      const capitalizeFirst = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

      // Format fields
      const depot = capitalizeFirst(data.depot);
      const start = capitalizeFirst(data.start);
      const end = capitalizeFirst(data.end);
      const via = capitalizeFirst(data.via);
      const routeName = capitalizeFirst(data.routeName);

      // Check duplicate routeNo
      const exists = await busRoutesModel.findOne({
        where: { routeNo: data.routeNo },
      });

      if (exists) {
        return res.status(409).json({ message: "Route number already exists" });
      }

      // Create
      await busRoutesModel.create({
        depot,
        start,
        end,
        via,
        routeNo: data.routeNo,
        routeName,
        routeDistance: data.routeDistance,
        depot_to_start_distance: data.depot_to_start_distance,
        end_to_depot_distance: data.end_to_depot_distance,
        estimated_collection: data.estimated_collection,
        status: data.status || "Active",
      });

      return res.status(200).json({ message: "Success" });
    } catch (err) {
      console.error("Create route error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  async updateBusRoutes(req, res) {
    try {
      let data = req.body.requestObject;

      const capitalizeFirst = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

      const depot = capitalizeFirst(data.depot);
      const start = capitalizeFirst(data.start);
      const end = capitalizeFirst(data.end);
      const via = capitalizeFirst(data.via);
      const routeName = capitalizeFirst(data.routeName);

      // Prevent duplicate routeNo on update
      const { Op } = require("sequelize");

      const exists = await busRoutesModel.findOne({
        where: {
          routeNo: data.routeNo,
          id: { [Op.ne]: data.id },
        },
      });

      if (exists) {
        return res.status(409).json({ message: "Route number already exists" });
      }

      await busRoutesModel.update(
        {
          depot,
          start,
          end,
          via,
          routeNo: data.routeNo,
          routeName,
          routeDistance: data.routeDistance,
          depot_to_start_distance: data.depot_to_start_distance,
          end_to_depot_distance: data.end_to_depot_distance,
          estimated_collection: data.estimated_collection,
          status: data.status,
        },
        { where: { id: data.id } }
      );

      return res.status(200).json({ message: "Success" });
    } catch (err) {
      console.error("Update route error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  deleteBusRoutes(req, res) {
    try {
      const data = req.body.requestObject;
      console.log("Delete Route:", data);

      busRoutesModel.update(
        { status: "Inactive" },
        { where: { id: data.id } }
      )
        .then(() => {
          return res.status(200).json({ message: "Success" });
        })
        .catch((err) => {
          console.error("Delete error:", err);
          return res.status(500).json({ message: "Failed to delete route" });
        });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },


  async getRouteSuggestions(req, res) {
    try {
      const field = req.query.field; // depot | start | end | via | routeNo | routeName

      if (!["depot", "start", "end", "via", "routeNo", "routeName"].includes(field)) {
        return res.status(400).json({ message: "Invalid field" });
      }

      const results = await busRoutesModel.findAll({
        attributes: [
          [
            require("sequelize").fn(
              "DISTINCT",
              require("sequelize").col(field)
            ),
            field,
          ],
        ],
        where: { status: "Active" },
      });

      const suggestions = results.map((r) => r[field]).filter(Boolean);

      return res.status(200).json(suggestions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  //   const driverMasterModel = require("../models").driverMaster;
  // const conductorMasterModel = require("../models").conductorMaster;

  saveDriver(req, res) {
    console.log("reqqqqqqqqqqq", req.body);

    try {
      const data = {
        driver_id: req.body.driver_id,
        driver_name: req.body.driver_name,
        contact_no: req.body.contact_no,
        aadhaar: req.body.aadhaar,
        pan: req.body.pan,
        voter: req.body.voter,
        dl: req.body.dl,
        address: req.body.address,
        status: "Active",
        photo: req.file ? `image/driver/${req.file.filename}` : null,
      };
      return driverMasterModel
        .create(data)
        .then((project) => {
          console.log("hhhhhhhhhhhhhhh", project);
          res.status(200).send({ message: "Success" });
        })
        .catch((err) => {
          console.log("DB error:", err);
          res.status(500).send({ message: "Database error" });
        });
    } catch (err) {
      console.log("Server error:", err);
      res.status(500).send({ message: "Server error" });
    }
  },

  updateDriver(req, res) {
    try {
      const {
        id,
        driver_id,
        driver_name,
        contact_no,
        aadhaar,
        pan,
        voter,
        dl,
        address,
        old_photo,
      } = req.body;

      if (!id) {
        return res.status(400).send({ message: "Driver ID is required" });
      }

      // keep old photo by default
      let photoPath = old_photo;

      // if new photo uploaded
      if (req.file) {
        photoPath = `image/driver/${req.file.filename}`;

        // delete old photo
        if (old_photo) {
          const fullOldPath = path.join(config.FILE_UPLOAD_PATH, old_photo);

          if (fs.existsSync(fullOldPath)) {
            fs.unlinkSync(fullOldPath);
          }
        }
      }

      const updateData = {
        driver_id,
        driver_name,
        contact_no,
        aadhaar,
        pan,
        voter,
        dl,
        address,
        photo: photoPath,
      };

      driverMasterModel
        .update(updateData, { where: { id } })
        .then(() => {
          return res
            .status(200)
            .send({ message: "Driver updated successfully" });
        })
        .catch((err) => {
          console.log("DB error:", err);
          res.status(500).send({ message: "Database error" });
        });
    } catch (err) {
      console.log("Server error:", err);
      res.status(500).send({ message: "Server error" });
    }
  },

  deleteDriver(req, res) {
    let data = req.body.requestObject;
    driverMasterModel
      .update({ status: "Inactive" }, { where: { id: data.id } })
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  getDriver(req, res) {
    console.log("here");
    let query = {
      where: { status: "Active" },
      raw: true,
      order: [["id", "DESC"]],
    };

    return driverMasterModel
      .findAll(query)
      .then((routes) => {
        return res.status(200).send(routes);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  saveConductor(req, res) {
    console.log("reqqqqqqqqqqq", req.body);

    try {
      const data = {
        conductor_id: req.body.conductor_id,
        conductor_name: req.body.conductor_name,
        contact_no: req.body.contact_no,
        aadhaar: req.body.aadhaar,
        pan: req.body.pan,
        voter: req.body.voter,
        dl: req.body.dl,
        address: req.body.address,
        status: "Active",
        photo: req.file ? `image/conductor/${req.file.filename}` : null,
      };

      return conductorMasterModel
        .create(data)
        .then((project) => {
          console.log("hhhhhhhhhhhhhhh", project);
          res.status(200).send({ message: "Success" });
        })
        .catch((err) => {
          console.log("DB error:", err);
          res.status(500).send({ message: "Database error" });
        });
    } catch (err) {
      console.log("Server error:", err);
      res.status(500).send({ message: "Server error" });
    }
  },

  updateConductor(req, res) {
    try {
      const {
        id,
        conductor_id,
        conductor_name,
        contact_no,
        aadhaar,
        pan,
        voter,
        dl,
        address,
        old_photo,
      } = req.body;

      if (!id) {
        return res.status(400).send({ message: "Conductor ID is required" });
      }

      // decide photo path
      let photoPath = old_photo;

      // if new photo uploaded
      if (req.file) {
        photoPath = `image/conductor/${req.file.filename}`;

        // 🔥 delete old photo from disk
        if (old_photo) {
          const fullOldPath = path.join(config.FILE_UPLOAD_PATH, old_photo);

          if (fs.existsSync(fullOldPath)) {
            fs.unlinkSync(fullOldPath);
          }
        }
      }

      const updateData = {
        conductor_id,
        conductor_name,
        contact_no,
        aadhaar,
        pan,
        voter,
        dl,
        address,
        photo: photoPath,
      };

      return conductorMasterModel
        .update(updateData, { where: { id } })
        .then(() => {
          res.status(200).send({ message: "Conductor updated successfully" });
        })
        .catch((err) => {
          console.log("DB error:", err);
          res.status(500).send({ message: "Database error" });
        });
    } catch (err) {
      console.log("Server error:", err);
      res.status(500).send({ message: "Server error" });
    }
  },

  deleteConductor(req, res) {
    let data = req.body.requestObject;
    conductorMasterModel
      .update({ status: "Inactive" }, { where: { id: data.id } })
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },
  blockConductor(req, res) {
    let data = req.body.requestObject;
    console.log("status ", data.status);
    let status = data.status == "Block" ? "Active" : "Block";
    conductorMasterModel
      .update({ status: status }, { where: { id: data.id } })
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  // getConductor(req, res) {
  //   console.log("here1");
  //   let query = {
  //     where: {
  //       [Op.or]: [{ status: "Active" }, { status: "Block" }],
  //     },
  //     raw: true,
  //     order: [["id", "DESC"]],
  //   };

  //   return conductorMasterModel
  //     .findAll(query)
  //     .then((routes) => {
  //       return res.status(200).send(routes);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       return res.status(400).send(error);
  //     });
  // },

  // const { Op, fn, col, literal } = require("sequelize");



  // const { Op, literal } = require("sequelize");

  getConductor(req, res) {
    let query = {
      where: {
        [Op.or]: [{ status: "Active" }, { status: "Block" }],
      },
      attributes: {
        include: [
          [
            literal(`(
            SELECT 
              COALESCE(
                SUM(
                  COALESCE(du.tragetedEarning,0) 
                  - COALESCE(du.netAmountDeposited,0)
                ),
                0
              )
            FROM dailyUpdates du
            WHERE du.conductorId = conductorMaster.id
          )`),
            "amountToBeDeposited",
          ],
        ],
      },
      raw: true,
      order: [["id", "DESC"]],
    };

    return conductorMasterModel
      .findAll(query)
      .then((data) => res.status(200).send(data))
      .catch((error) => {
        console.error(error);
        return res.status(400).send(error);
      });
  },

  // const { Op, Sequelize } = require("sequelize");

  getConductorAttendance(req, res) {
    try {
      // const { month } = req.body;
      const month = req.query.month;
      // expected format: "2025-09-01"

      if (!month) {
        return res.status(400).send({ message: "Month is required" });
      }

      const sql = `
        WITH RECURSIVE calendar AS (
            SELECT DATE(:month) AS day
            UNION ALL
            SELECT day + INTERVAL 1 DAY
            FROM calendar
            WHERE day < LAST_DAY(:month)
        ),
        attendance_raw AS (
            SELECT
                cm.id AS conductor_id,
                cm.conductor_name,
                c.day,
                CASE
                    WHEN du.conductorId IS NOT NULL THEN 'P'
                    ELSE 'A'
                END AS status
            FROM conductorMasters cm
            CROSS JOIN calendar c
            LEFT JOIN dailyUpdates du
                ON du.conductorId = cm.id
               AND DATE(du.date) = c.day
            WHERE cm.status IN ('Active', 'Block')
        )
        SELECT
            conductor_name AS conductor,
            JSON_OBJECTAGG(
                DATE_FORMAT(day, '%Y-%m-%d'),
                status
            ) AS attendance
        FROM attendance_raw
        GROUP BY conductor_id, conductor_name
        ORDER BY conductor_name;
      `;

      return sequelize
        .query(sql, {
          replacements: { month },
          type: Sequelize.QueryTypes.SELECT,
        })
        .then((data) => {
          return res.status(200).send(data);
        })
        .catch((error) => {
          console.error(error);
          return res.status(400).send(error);
        });
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },

  async saveDailyUpdates(req, res) {
    try {
      let data = req.body.requestObject;
      data.status = "Active";

      // 1️⃣ Get last timesheetNo
      const lastRecord = await dailyUpdatesModel.findOne({
        where: {
          timesheetNo: { [require('sequelize').Op.ne]: null }
        },
        order: [['id', 'DESC']],
        attributes: ['timesheetNo']
      });

      let nextNumber = 1;
      const prefix = 'ASTC-SKAP-';

      if (lastRecord && lastRecord.timesheetNo) {
        const lastNo = lastRecord.timesheetNo;   // ASTC-SKAP-7
        const parts = lastNo.split('-');
        const num = parseInt(parts[parts.length - 1], 10);

        if (!isNaN(num)) {
          nextNumber = num + 1;
        }
      }

      // 2️⃣ Set new timesheet number
      data.timesheetNo = prefix + nextNumber;

      // 3️⃣ Insert record
      const response = await dailyUpdatesModel.create(data);

      return res.status(200).send({
        message: "Success",
        id: response.id,
        timesheetNo: data.timesheetNo
      });

    } catch (err) {
      console.log("err", err);
      return res.status(500).send({ message: "Error saving data" });
    }
  },


  updateDailyUpdates(req, res) {
    let { requestObject, id } = req.body;

    console.log("requestObject", requestObject);
    console.log("id", id);

    let data = requestObject;

    dailyUpdatesModel
      .update(requestObject, { where: { id: id } })
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });

    // dailyUpdatesModel
    //   .create(data)
    //   .then((response) => {
    //     return res.status(200).send({ message: "Success" });
    //   })
    //   .catch((err) => {
    //     console.log("err", err);
    //   });
  },

  createTrips(req, res) {
    console.log("res ", req.body.requestObject);
    tripModel
      .create(req.body.requestObject)
      .then((response) => {
        return res.status(200).send({ message: "Success", response: response });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  async updateTrips(req, res) {
    let { id, requestObject } = req.body;
    console.log("id", id);
    console.log("requestObject", requestObject);

    // let sqlQuery = `SELECT * FROM trip_statuses WHERE tripId='${id}' Order By id DESC LIMIT 1`
    // const [results] = await sequelize.query(sqlQuery);

    // console.log("results", results);
    // let travel_id = results[0].travel_id;
    // console.log("travel_id", travel_id);
    // // if()

    // return res.send({'data': travel_id});

    tripModel
      .update(requestObject, { where: { id: id } })
      .then((response) => {
        return res.status(200).send({ message: "Success", response: response });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  // getBusList(req, res) {
  //   let query = {
  //     where:{status:'Active'},
  //     raw: true,
  //     order: [["id", "DESC"]],
  //   };

  //   return busModel
  //     .findAll(query)
  //     .then((bus) => {
  //       return res.status(200).send(bus);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       return res.status(400).send(error);
  //     });
  // },

  // *****************************************
  getBusList(req, res) {
    const reqDate = req.query.date;
    let filterDate;

    if (reqDate) {
      const [yyyy, mm, dd] = reqDate.split("-");
      filterDate = `${yyyy}-${mm}-${dd}`;
    } else {
      filterDate = null;
    }

    console.log("filterDate", filterDate);

    const sql = `
SELECT 
    bus.id,
    bus.busName,
    bus.busNo,
    bus.baseDepot,
    -- bus.conductorName,
    -- bus.conductorContactNo,
    -- bus.conductorId,
    -- bus.driverName,
    -- bus.driverContactNo,
    bus.status,
    bus.createdAt,
    bus.updatedAt,


    cm.conductor_name as conductorName,
    cm.conductor_id as conductorId,
    cm.contact_no as conductorContactNo,
    
    dm.driver_name as driverName,
    dm.contact_no as driverContactNo,
    dm.driver_id as driverId,

    -- Route fields
    routes.id AS routeId,
    routes.routeNo AS routeNo,
    routes.depot AS routeDepot,
    routes.start AS routeStart,
    routes.end AS routeEnd,
    routes.via AS routeVia,
    routes.routeDistance AS routeDistance,

    du.currentStatus AS currentStatus,
    du.noOfTrip AS noOfTrip,
    du.id AS dailyUpdateId,

    cm.status AS conductorStatus

FROM busMasters AS bus

JOIN busRoutesMasters AS routes 
    ON bus.allotedRouteNo = routes.id

LEFT JOIN conductorMasters AS cm
    ON cm.id = bus.conductorId


LEFT JOIN driverMasters as dm
    ON bus.driverId = dm.id

LEFT JOIN dailyUpdates AS du
    ON du.busId = bus.id
   AND du.date = ${filterDate ? "?" : "CURDATE()"}
   AND du.createdAt = (
        SELECT MAX(createdAt)
        FROM dailyUpdates
        WHERE busId = bus.id
          AND date = ${filterDate ? "?" : "CURDATE()"}
   )

WHERE bus.status = 'Active'
  AND routes.status = 'Active'

ORDER BY bus.id DESC;
`;

    const replacements = filterDate ? [filterDate, filterDate] : [];

    sequelize
      .query(sql, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      })
      .then((bus) => {
        return res.status(200).send(bus);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  // *****************************************

  // getBusData(req, res) {
  //   let busId = req.body.busId;
  //   let query = {
  //     raw: true,
  //     where: {
  //       id: { [Op.eq]: busId },
  //       status:'Active'
  //     },
  //   };

  //   return busModel
  //     .findOne(query)
  //     .then((bus) => {
  //       return res.status(200).send(bus);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       return res.status(400).send(error);
  //     });
  // },

  getBusData(req, res) {
    const busId = req.body.busId;

    const sql = `
    SELECT 
    busMasters.id,
    busMasters.busName,
    busMasters.allotedRouteNo,
    busMasters.busNo,
    busMasters.baseDepot,
    -- busMasters.conductorName,
    -- busMasters.conductorContactNo,
    -- busMasters.driverName,
    -- busMasters.driverContactNo,
    busMasters.status,
    busMasters.createdAt,
    busMasters.updatedAt,
    -- busMasters.driverId,
    --busMasters.conductorId,

    conductorMasters.conductor_name as conductorName,
    conductorMasters.conductor_id as conductorId,
    conductorMasters.contact_no as conductorContactNo,
    
    driverMasters.driver_name as driverName,
    driverMasters.contact_no as driverContactNo,
    driverMasters.driver_id as driverId,
    
    busRoutesMasters.routeNo AS routeNo,
    busRoutesMasters.start AS routeStart,
    busRoutesMasters.end AS routeEnd,
    busRoutesMasters.via AS routeVia,
    busRoutesMasters.depot AS routeDepot,
    busRoutesMasters.depot AS routeName,
    busRoutesMasters.routeDistance AS routeDistance,
    -- 🔹 Last CMR from dailyUpdates
    COALESCE(
        (
            SELECT du.cmr
            FROM dailyUpdates du
            WHERE du.busId = busMasters.id
            ORDER BY du.createdAt DESC
            LIMIT 1
        ),
        0
    ) AS lastCmr
FROM busMasters
LEFT JOIN busRoutesMasters 
  ON busMasters.allotedRouteNo = busRoutesMasters.id

LEFT JOIN conductorMasters 
  ON busMasters.conductorId = conductorMasters.id

  LEFT JOIN driverMasters 
  ON busMasters.driverId = driverMasters.id

WHERE busMasters.id = :busId 
AND busMasters.status = 'Active'
LIMIT 1;

    `;

    sequelize
      .query(sql, {
        replacements: { busId },
        type: sequelize.QueryTypes.SELECT,
      })
      .then((bus) => {
        return res.status(200).send(bus.length ? bus[0] : {});
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  // getDailyUpdates(req, res){
  //   let date = req.body.date;
  //   let query = {
  //     raw: true,
  //     where: {
  //       date: { [Op.eq]: date },
  //     },
  //   };

  //   return dailyUpdatesModel
  //     .findAll(query)
  //     .then((bus) => {
  //       return res.status(200).send(bus);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       return res.status(400).send(error);
  //     });

  // },

  async getDailyUpdates(req, res) {
    let { dateFrom, dateTo } = req.body;

    console.log("dateFrom - dateTo", dateFrom, dateTo);

    let sqlQuery = `
        SELECT du.id as duId, du.*, bm.*, br.*
        FROM dailyUpdates AS du
        INNER JOIN busMasters AS bm ON bm.id = du.busId
        INNER JOIN busRoutesMasters AS br ON br.routeNo = du.routeNo
        WHERE du.date BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d') AND br.status='Active' AND du.status='Active'
    `;

    try {
      const [results] = await sequelize.query(sqlQuery, {
        replacements: [dateFrom, dateTo],
      });

      console.log("res =>", results);
      res.send(results);
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).send({ error: "Failed to fetch data" });
    }
  },

  async getOneTripDetails(req, res) {
    let { id } = req.body;

    console.log("id===>>", id);

    let sqlQuery = `
        SELECT  bm.id as busId, bm.*, br.id as routeNo, br.*, du.id as id, du.*
        FROM dailyUpdates AS du
        INNER JOIN busMasters AS bm ON bm.id = du.busId
        INNER JOIN busRoutesMasters AS br ON br.routeNo = du.routeNo
        WHERE du.id = ?
    `;

    try {
      const [results] = await sequelize.query(sqlQuery, {
        replacements: [id],
      });

      console.log("res =>", results);
      res.send(results);
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).send({ error: "Failed to fetch data" });
    }
  },

  deleteEarningDetails(req, res) {
    let data = req.body.requestObject;
    dailyUpdatesModel
      .update({ status: "Inactive" }, { where: { id: data.duId } })
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  getTripList(req, res) {
    let query = {
      raw: true,
      order: [["id", "DESC"]],
    };

    return tripModel
      .findAll({
        query,
        include: [
          {
            model: busModel,
          },
        ],
      })
      .then((trips) => {
        return res.status(200).send(trips);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  getTripStatusList(req, res) {
    let query = {
      raw: true,
      order: [["id", "DESC"]],
    };

    return trip_statusModel
      .findAll(query)
      .then((trips) => {
        return res.status(200).send(trips);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  async createTripStatus(req, res) {
    console.log("res1 ", req.body.requestObject);
    console.log("res2 ", req.body.type);

    // return;

    let req_data = req.body.requestObject;

    if (req.body.type === "create") {
      let sqlQuery = `SELECT * FROM trip_statuses Order By id DESC LIMIT 1`;
      const [results] = await sequelize.query(sqlQuery);

      let last_travel_id = results[0]?.travel_id;

      if (!last_travel_id) {
        last_travel_id = 0;
      }
      req_data.travel_id = last_travel_id + 1; //add 1 to last_travel_id to make it unique
    }
    // need it
    trip_statusModel
      .create(req_data)
      .then((response) => {
        return res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  getUserList(req, res) {
    let query = {
      raw: true,
      order: [["position", "ASC"]],
      where: {
        role: { [Op.ne]: "head_office" },
      },
    };

    console.log("Query is==========> ", query);
    return usersModel
      .findAll(query)
      .then((user) => {
        return res.status(200).send(user);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  saveImg(req, res) {
    console.log("oooooooooooooooooooooooooo", req.file);
    console.log("jjjjjjjjjjjjjjjjj", req.body);
    if (!req.file) {
      console.log("File not found");
      return res.status(400).send({ status: false, message: "File not found" });
    } else {
      return busModel
        .create({
          bus_name: req.body.bus_name,
          bus_no: req.body.bus_no,
          bus_type: req.body.bus_type,
          from: req.body.from,
          to: req.body.to,
          via: req.body.via,
          owner: req.body.owner,
          fuel_type: req.body.fuel_type,
          ac: req.body.ac,
          division: req.body.division,
          bus_super_type: req.body.bus_super_type,
          bus_image: req.file.originalname,
        })
        .then((project) => res.status(200).send({ message: "success" }))
        .catch((error) => res.status(400).send(error));
    }
  },

  getArrivalBusList(req, res) {
    let requestObject = req.body.body;
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Calculate the nearest one hour range
    const oneHourBefore = new Date(now.getTime() - 60 * 60 * 1000); // One hour before current time
    const oneHourAfter = new Date(now.getTime() + 60 * 60 * 1000); // One hour after current time
    console.log("oneHourBefore==========> ", oneHourBefore);
    console.log("oneHourAfter==========> ", oneHourAfter);
    return trip_statusModel
      .findAll({
        order: [["id", "ASC"]],
        where: {
          createdAt: {
            [Op.between]: [startOfDay, endOfDay], // Filter by today's date
          },
          [Op.or]: [
            {
              next_stop: { [Op.eq]: requestObject.station.toUpperCase() },
              status: { [Op.eq]: "Departed" },
              createdAt: {
                [Op.between]: [oneHourBefore, oneHourAfter], // Filter by the nearest one hour
              },
            },
            {
              station: { [Op.eq]: requestObject.station.toUpperCase() },
              status: { [Op.ne]: "Departed" },
              createdAt: {
                [Op.between]: [oneHourBefore, oneHourAfter], // Filter by the nearest one hour
              },
            },
          ],
        },
        include: [
          {
            model: tripModel,
            include: [
              {
                model: busModel,
              },
            ],
          },
        ],
        // attributes: {
        //   include: [
        //     [Sequelize.fn('DISTINCT', Sequelize.col('tripId')), 'tripId']
        //   ]
        // },
        // raw: true
      })
      .then((trip) => {
        return res.status(200).send(trip);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  getDepartedBusList(req, res) {
    let requestObject = req.body.body;
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Calculate the nearest one hour range
    const oneHourBefore = new Date(now.getTime() - 60 * 60 * 1000); // One hour before current time
    const oneHourAfter = new Date(now.getTime() + 60 * 60 * 1000); // One hour after current time
    console.log("oneHourBefore==========> ", oneHourBefore);
    console.log("oneHourAfter==========> ", oneHourAfter);
    return trip_statusModel
      .findAll({
        order: [["id", "ASC"]],
        where: {
          station: { [Op.eq]: requestObject.station.toUpperCase() },
          status: { [Op.eq]: "Departed" },
          createdAt: {
            [Op.between]: [startOfDay, endOfDay], // Filter by today's date
          },
          [Op.or]: [
            {
              createdAt: {
                [Op.between]: [oneHourBefore, oneHourAfter], // Filter by the nearest one hour
              },
            },
          ],
        },
        include: [
          {
            model: tripModel,
            include: [
              {
                model: busModel,
              },
            ],
          },
        ],
      })
      .then((trip) => {
        return res.status(200).send(trip);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  // async screen1(req, res) {

  //   // let my_station = "ISBT"
  //   let my_station = "Khanapara"

  //   const sqlQuery = `
  //   SELECT
  //     bm.id AS bus_id,
  //     bm.bus_name,
  //     bm.bus_no,
  //     t.id as tripId,
  //     t.from,
  //     t.to,
  //     t.via,
  //     ts.date,
  //     ts.station,
  //     ts.next_stop,
  //     ts.gate,
  //     ts.std,
  //     ts.etd,
  //     CASE
  //       WHEN ts.next_stop = '${my_station}' AND ts.status = 'Departed' THEN 'Arriving'
  //       ELSE ts.status
  //     END AS status
  //   FROM
  //     busMasters AS bm
  //   JOIN
  //     trips AS t ON bm.id = t.busMasterId
  //   JOIN
  //     (
  //       SELECT
  //         tripId,
  //         date,
  //         station,
  //         std,
  //         etd,
  //         gate,
  //         next_stop,
  //         status
  //       FROM
  //         trip_statuses AS ts1
  //       WHERE
  //         id = (
  //           SELECT MAX(id)
  //           FROM trip_statuses
  //           WHERE tripId = ts1.tripId
  //         )
  //     ) AS ts ON t.id = ts.tripId;
  // `;

  //   const [results, metadata] = await sequelize.query(sqlQuery); // Metadata contains additional query info
  //   console.log(results);
  //   res.send(results);
  // },

  async screen1(req, res) {
    let { role, station } = req.body.body;
    console.log("req.body ==> ", req.body.body);
    console.log("role ==> ", role);
    console.log("station ==> ", station);

    let my_station = station;
    // let my_station = "ISBT";
    // let my_station = "Khanapara";
    // let my_station = "Morigaon";

    const sqlQuery = `
  SELECT 
    bm.id AS bus_id, 
    bm.bus_name, 
    bm.bus_no, 
    t.id AS tripId,
    t.trip_name,
    t.from, 
    t.to, 
    t.via,
    ts.date,
    ts.station, 
    ts.next_stop,
    ts.gate,
    ts.std,
    ts.etd,
    ts.status as station_status,
    ts.travel_id,
    CASE
      WHEN ts.next_stop = '${my_station}' AND ts.status = 'Departed' THEN 'Arriving'
      ELSE ts.status
    END AS status,
    -- Format stations as JSON-like string using GROUP_CONCAT
    CONCAT(
      '[', 
      (
        SELECT GROUP_CONCAT(
          CONCAT(
            '{"station_id":', s.id, 
            ',"station_name":"', s.name, '"}'
          )
        ) 
        FROM stations AS s
        WHERE s.trip_id = t.id
      ), 
      ']'
    ) AS stations,
    -- Add active_status column
    CASE
      WHEN '${my_station}' = ts.station OR ('${my_station}' = ts.next_stop AND ts.status = 'Departed') THEN TRUE
      ELSE FALSE
    END AS access_status,

    -- Add our_status column
    CASE

    WHEN (
      ts.status = 'Schedule'
    ) THEN 'Scheduled'
    WHEN (
      ts.station = '${my_station}'
    ) THEN ts.status

       WHEN (
        SELECT MAX(s.id) 
        FROM trip_statuses AS s 
        WHERE s.station = '${my_station}' AND s.status = 'Departed' AND s.tripId = t.id AND s.date = ts.date AND s.std = ts.std
      ) > 0 THEN 'Departed'
      

      ELSE 'Arriving'

    END AS our_status,

    -- Add scheduled_time column
    CASE
    WHEN (
      SELECT COUNT(*)
      FROM stations AS s
      WHERE s.name = '${my_station}' AND s.trip_id = t.id
    ) > 0
    THEN (
      SELECT TIME_FORMAT(ADDTIME(ts.std, SEC_TO_TIME(s.est * 60)), '%H:%i')
      FROM stations AS s 
      WHERE s.name = '${my_station}' AND s.trip_id = t.id
    )
    ELSE ts.std
  END AS schedule_time,

  -- Add estimated_time column
  CASE
  WHEN (
    '${my_station}' = ts.station
  )
  THEN ts.etd
  WHEN (
    SELECT COUNT(*)
    FROM stations AS s
    WHERE s.name = '${my_station}' AND s.trip_id = t.id
  ) > 0
  THEN (
    SELECT TIME_FORMAT(ADDTIME(ts.etd, SEC_TO_TIME(s.est * 60)), '%H:%i')
    FROM stations AS s 
    WHERE s.name = '${my_station}' AND s.trip_id = t.id
  )
  ELSE ts.etd
END AS estimated_time,

-- Add stop_time column
(
  SELECT s.stop_time
  FROM stations AS s
  WHERE s.name = '${my_station}' AND s.trip_id = t.id
  LIMIT 1
) AS stop_time,


-- Add d_time column
-- Add departed_time column
(
  SELECT TIME_FORMAT(
    ADDTIME(
      (SELECT TIME_FORMAT(ADDTIME(ts.std, SEC_TO_TIME(s.est * 60)), '%H:%i')
       FROM stations AS s 
       WHERE s.name = '${my_station}' AND s.trip_id = t.id),
      SEC_TO_TIME(s.stop_time * 60)
    ),
    '%H:%i'
  )
  FROM stations AS s
  WHERE s.name = '${my_station}' AND s.trip_id = t.id
) AS d_time

  FROM 
    busMasters AS bm
  JOIN 
    trips AS t ON bm.id = t.busMasterId AND t.isActive = 1
  JOIN 
    (
      SELECT 
        tripId, 
        date,
        station,
        std,
        etd,
        gate,
        next_stop,
        status,
        travel_id 
      FROM 
        trip_statuses AS ts1
      WHERE 
        id = (
          SELECT MAX(id) 
          FROM trip_statuses 
          WHERE tripId = ts1.tripId
        )
    ) AS ts ON t.id = ts.tripId
    WHERE EXISTS (
      SELECT 1 
      FROM stations AS s
      WHERE s.name = '${my_station}' AND s.trip_id = t.id
    )
`;
    try {
      const [results] = await sequelize.query(sqlQuery);
      // Parse the 'stations' field into valid JSON
      const formattedResults = results.map((row) => {
        if (row.stations) {
          row.stations = JSON.parse(row.stations); // Convert JSON-like string to JSON array
        }
        return row;
      });
      console.log(formattedResults);
      res.send(formattedResults);
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).send({ error: "Failed to fetch data" });
    }
  },

  saveStations(req, res) {
    const { stations, id } = req.body;

    if (!stations || !Array.isArray(stations) || stations.length === 0) {
      return res.status(400).send({ message: "Invalid stations array" });
    }

    // Map each station with the provided trip_id
    const stationsData = stations.map((station) => ({
      trip_id: id,
      name: station.name || "",
      est: station.est || 0,
      stop_time: station.stop_time || 0,
      gate: station.gate || "",
    }));

    stationsModel
      .bulkCreate(stationsData) // Bulk insert all stations
      .then((response) => {
        return res.status(200).send({
          message: "Success",
          data: response, // Send the created station objects back to the client
        });
      })
      .catch((err) => {
        console.error("Error saving stations:", err);
        return res.status(500).send({
          message: "Failed to save stations",
          error: err.message || "Internal Server Error",
        });
      });
  },

  getStationList(req, res) {
    const { id } = req.body;
    console.log("id", id);

    let query = {
      raw: true,
      order: [["id", "ASC"]],
      where: { trip_id: { [Op.eq]: id } },
    };

    return stationsModel
      .findAll(query)
      .then((bus) => {
        return res.status(200).send(bus);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
      });
  },

  async report(req, res) {
    console.log("working here...", req.body.requestObject);

    let date1 = req.body.requestObject.fromDate;
    let date2 =
      req.body.requestObject.toDate || req.body.requestObject.fromDate;
    let status = req.body.requestObject.status;
    let busNo = req.body.requestObject.busNo;

    // Dynamically build WHERE conditions
    let whereConditions = [
      `lts.date BETWEEN ${sequelize.escape(date1)} AND ${sequelize.escape(
        date2
      )}`,
    ];

    if (status) {
      whereConditions.push(`lts.status = ${sequelize.escape(status)}`);
    }

    let dataQuery = `
    WITH LatestTripStatuses AS (
      SELECT 
        ts.*,
        ROW_NUMBER() OVER (PARTITION BY ts.travel_id ORDER BY ts.id DESC) AS rn
      FROM trip_statuses ts
    )
    SELECT 
      lts.id,
      lts.travel_id,
      lts.date,
      lts.status,
      t.trip_name AS tripName, 
      t.from AS tripFrom, 
      t.to AS tripTo,
      bm.bus_name AS busName, 
      bm.bus_no AS busNo
    FROM LatestTripStatuses lts
    JOIN trips t ON t.id = lts.tripId
    JOIN busMasters bm ON t.busMasterId = bm.id
    WHERE lts.rn = 1
    ${whereConditions.length ? `AND ${whereConditions.join(" AND ")}` : ""}
    ${busNo ? `AND bm.bus_no = ${sequelize.escape(busNo)}` : ""
      } ORDER BY lts.date ASC;
  `;

    // let countQuery = `
    //   WITH LatestTripStatuses AS (
    //     SELECT
    //       ts.travel_id,
    //       ts.date,
    //       ROW_NUMBER() OVER (PARTITION BY ts.travel_id ORDER BY ts.date DESC, ts.id DESC) AS rn
    //     FROM trip_statuses ts
    //   )
    //   SELECT COUNT(*) as totalCount
    //   FROM LatestTripStatuses lts
    //   WHERE lts.rn = 1
    //   ${whereConditions.length ? `AND ${whereConditions.join(" AND ")}` : ""}
    //   ${busNo ? `AND EXISTS (SELECT 1 FROM trips t JOIN busMasters bm ON t.busMasterId = bm.id WHERE t.id = lts.tripId AND bm.bus_no = ${sequelize.escape(busNo)})` : ""};
    // `;

    try {
      // Execute both queries
      const [dataResults] = await sequelize.query(dataQuery);
      // const [countResults] = await sequelize.query(countQuery);

      const formattedResults = dataResults.map((row) => row);
      // const totalCount = countResults[0]?.totalCount || 0;

      res.send({
        // totalCount: '',
        data: formattedResults,
      });
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).send({ error: "Failed to fetch data" });
    }
  },

  async getDashboardCounts(req, res) {
    const today = new Date().toISOString().split("T")[0];

    try {

      const todayEarning = await dailyUpdatesModel.sum('netAmountDeposited', {
        where: {
          date: today,
        },
      });

      // Create yesterday's date in YYYY-MM-DD format
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yyyy = yesterday.getFullYear();
      const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
      const dd = String(yesterday.getDate()).padStart(2, '0');

      const yesterdayDate = `${yyyy}-${mm}-${dd}`;

      // Query
      const yesterdayEarning = await dailyUpdatesModel.sum('netAmountDeposited', {
        where: {
          date: yesterdayDate
        }
      });


      const totalBus = await busMasterModel.count({
        where: {
          status: "Active",
        },
      });
      const totalDriver = await driverMasterModel.count({
        where: {
          status: "Active",
        },
      });
      const totalConductor = await conductorMasterModel.count({
        where: {
          status: "Active",
        },
      });
      const totalRoute = await busRoutesModel.count({
        where: {
          status: "Active",
        },
      });

      const runningBus = await dailyUpdatesModel.count({
        where: {
          date: today,
          currentStatus: "running",
        },
      });

      const runningVehicle = await sequelize.query(
        `
  SELECT 
    du.id,
    bm.busNo,
    br.routeNo AS routeNo,
    du.driverId,
    du.conductorId
  FROM dailyUpdates AS du
  INNER JOIN busMasters AS bm ON du.busId = bm.id
  LEFT JOIN busRoutesMasters AS br ON bm.allotedRouteNo = br.id
  WHERE du.date = :today 
    AND du.currentStatus = 'Running'
  `,
        {
          replacements: { today },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const idleBus = await busMasterModel.findAll({
        where: {
          status: "Active",
          [Op.or]: [
            // No entry today
            {
              id: {
                [Op.notIn]: Sequelize.literal(`
            (SELECT busId FROM dailyUpdates WHERE date = '${today}')
          `),
              },
            },

            // Entry today but Idle or NULL
            {
              id: {
                [Op.in]: Sequelize.literal(`
            (SELECT busId FROM dailyUpdates 
             WHERE date = '${today}' 
             AND (currentStatus = 'Idle' OR currentStatus IS NULL))
          `),
              },
            },
          ],
        },
        attributes: [
          "id",
          "busName",
          "busNo",
          "baseDepot",
          "driverName",
          "conductorName",
        ],
        order: [["busName", "ASC"]],
      });

      const finishedBus = await dailyUpdatesModel.count({
        where: {
          date: today,
          currentStatus: "finished",
        }
      });

      const finishedBusData = await dailyUpdatesModel.findAll({
        where: {
          date: today,
          currentStatus: "finished",
        },
        attributes: [
          "busId",
          "routeNo",
          "driverId",
          "conductorId",
          "netAmountDeposited"
        ]
      });

      const stillBus = await dailyUpdatesModel.count({
        where: {
          date: today,
          currentStatus: "Still",
        },
      });

      const stillBusData = await dailyUpdatesModel.findAll({
        where: {
          date: today,
          currentStatus: "still",
        },
        attributes: [
          "busId",
          "routeNo",
          "driverId",
          "conductorId",
          "noOfTrip",
          "totalOperated",
          "remarks",
          "stopTime"
        ]
      });

      res.status(200).send({
        todayEarning,
        yesterdayEarning,
        totalBus,
        totalDriver,
        totalConductor,
        totalRoute,
        runningBus,
        runningVehicle,
        idleBus,
        idleBusCount: idleBus.length,
        finishedBus,
        finishedBusData,
        stillBus,
        stillBusData
      });
    } catch (error) {
      console.error("Error fetching dashboard counts:", error);
      res.status(500).send({ error: "Failed to fetch dashboard counts" });
    }
  },

  async getCurrentISTTime(req, res) {
    try {
      const { getCurrentIST } = require("../utils/utils");

      const istDate = getCurrentIST();

      log("IST Date:", istDate);

      res.status(200).send({
        currentIST: istDate,
        timestamp: istDate.getTime(),
        iso: istDate.toISOString(),
      });
    } catch (error) {
      console.error("Error fetching IST time:", error);
      res.status(500).send({ error: "Failed to fetch IST time" });
    }
  },

  async getAmountToBePaidByConductor(req, res) {

    const id = req.query.id;

    const sql = `SELECT 
                  SUM(
                      COALESCE(tragetedEarning, 0) 
                      - COALESCE(netAmountDeposited, 0)
                      ) AS amountToBeDeposited
                  FROM dailyUpdates
                  WHERE conductorId = ${id};
                  `;

    try {
      // Execute both queries
      const [dataResults] = await sequelize.query(sql);
      // const [countResults] = await sequelize.query(countQuery);

      const formattedResults = dataResults.map((row) => row);
      // const totalCount = countResults[0]?.totalCount || 0;

      res.send({
        // totalCount: '',
        data: formattedResults,
      });
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).send({ error: "Failed to fetch data" });
    }
  },
};
