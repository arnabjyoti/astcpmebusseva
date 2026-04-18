'use strict';
module.exports = (sequelize, type) => {
    const attendance = sequelize.define('attendance', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conductorId: {
            type: type.INTEGER,
            allowNull: false
        },
        attendanceDate: {
            type: type.STRING,
            allowNull: false
        },
        status: {
            type: type.STRING,
            allowNull: false
        },
        source: {
            type: type.STRING,
            allowNull: false,
            defaultValue: 'manual'
        }
    }, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['conductorId', 'attendanceDate']
            }
        ]
    });

    attendance.associate = function (models) {
        attendance.belongsTo(models.conductorMaster, {
            foreignKey: 'conductorId',
            as: 'conductor'
        });
    };

    return attendance;
};
