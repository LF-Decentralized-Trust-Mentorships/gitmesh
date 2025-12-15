"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const organizationCache = sequelize.define('organizationCache', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        url: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        emails: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
            default: [],
        },
        phoneNumbers: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
            default: [],
        },
        logo: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        tags: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
            default: [],
        },
        twitter: {
            type: sequelize_1.DataTypes.JSONB,
            default: {},
        },
        linkedin: {
            type: sequelize_1.DataTypes.JSONB,
            default: {},
        },
        github: {
            type: sequelize_1.DataTypes.JSONB,
            default: {},
        },
        crunchbase: {
            type: sequelize_1.DataTypes.JSONB,
            default: {},
        },
        employees: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        revenueRange: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        importHash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                len: [0, 255],
            },
        },
        location: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        website: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        founded: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        industry: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        size: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'A range representing the size of the company.',
        },
        naics: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.JSONB),
            allowNull: true,
            comment: 'industry classifications for a company according to NAICS',
        },
        headline: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'A brief description of the company',
        },
        ticker: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: "the company's stock symbol",
        },
        geoLocation: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        type: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: "The company's type. For example NGO",
        },
        employeeCountByCountry: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        address: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            comment: "granular information about the location of the company's current headquarters.",
        },
        lastEnrichedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        manuallyCreated: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        indexes: [
            {
                fields: ['url'],
                unique: true,
                where: {
                    deletedAt: null,
                    url: { [sequelize_1.Op.ne]: null },
                },
            },
        ],
        timestamps: true,
        paranoid: true,
    });
    return organizationCache;
};
//# sourceMappingURL=organizationCache.js.map