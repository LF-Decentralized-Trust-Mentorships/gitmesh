"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const organization = sequelize.define('organization', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        displayName: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        website: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        location: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'A detailed description of the company',
        },
        immediateParent: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        ultimateParent: {
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
        github: {
            type: sequelize_1.DataTypes.JSONB,
            default: {},
        },
        twitter: {
            type: sequelize_1.DataTypes.JSONB,
            default: {},
        },
        linkedin: {
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
            comment: 'total employee count of the company',
        },
        revenueRange: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            comment: 'inferred revenue range of the company',
        },
        importHash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                len: [0, 255],
            },
        },
        isTeamOrganization: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
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
        profiles: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
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
        attributes: {
            type: sequelize_1.DataTypes.JSONB,
            defaultValue: {},
        },
        affiliatedProfiles: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
        },
        allSubsidiaries: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
        },
        alternativeDomains: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
        },
        alternativeNames: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
        },
        averageEmployeeTenure: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
        },
        averageTenureByLevel: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        averageTenureByRole: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        directSubsidiaries: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
        },
        employeeChurnRate: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        employeeCountByMonth: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        employeeGrowthRate: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        employeeCountByMonthByLevel: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        employeeCountByMonthByRole: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        gicsSector: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        grossAdditionsByMonth: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        grossDeparturesByMonth: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['importHash', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                fields: ['url', 'tenantId'],
                unique: true,
                where: {
                    deletedAt: null,
                    url: { [sequelize_1.Op.ne]: null },
                },
            },
            {
                fields: ['name', 'tenantId'],
                unique: true,
                where: {
                    deletedAt: null,
                },
            },
        ],
        timestamps: true,
        paranoid: true,
    });
    organization.associate = (models) => {
        models.organization.belongsToMany(models.member, {
            as: 'members',
            through: 'memberOrganizations',
            foreignKey: 'organizationId',
        });
        models.organization.belongsToMany(models.segment, {
            as: 'segments',
            through: 'organizationSegments',
            timestamps: false,
        });
        models.organization.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.organization.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.organization.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return organization;
};
//# sourceMappingURL=organization.js.map