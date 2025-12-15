"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizeRepository_1 = __importDefault(require("../../repositories/sequelizeRepository"));
exports.default = async () => {
    const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    const totalMembersCount = await getMembersCount(options.database.sequelize);
    let currentMemberCount = 0;
    let currentOffset = 0;
    while (currentMemberCount < totalMembersCount) {
        const LIMIT = 200000;
        let updateMembers = [];
        let splittedBulkMembers = [];
        const members = await getMembers(options.database.sequelize, LIMIT, currentOffset);
        for (const member of members) {
            if (member.username.gitmeshUsername) {
                delete member.username.gitmeshUsername;
            }
            updateMembers.push(member);
        }
        const MEMBER_CHUNK_SIZE = 25000;
        if (updateMembers.length > MEMBER_CHUNK_SIZE) {
            splittedBulkMembers = [];
            while (updateMembers.length > MEMBER_CHUNK_SIZE) {
                splittedBulkMembers.push(updateMembers.slice(0, MEMBER_CHUNK_SIZE));
                updateMembers = updateMembers.slice(MEMBER_CHUNK_SIZE);
            }
            // push last leftover chunk
            if (updateMembers.length > 0) {
                splittedBulkMembers.push(updateMembers);
            }
            for (const memberChunk of splittedBulkMembers) {
                await options.database.member.bulkCreate(memberChunk, {
                    updateOnDuplicate: ['username'],
                });
            }
        }
        else {
            await options.database.member.bulkCreate(updateMembers, {
                updateOnDuplicate: ['username'],
            });
        }
        currentMemberCount += members.length;
        currentOffset += members.length;
    }
};
async function getMembers(seq, limit, offset) {
    const membersQuery = `
        select * from members m 
        ORDER  BY m."createdAt" DESC
        OFFSET :offset
        LIMIT  :limit
    `;
    const membersQueryParameters = {
        offset,
        limit,
    };
    return seq.query(membersQuery, {
        replacements: membersQueryParameters,
        type: sequelize_1.QueryTypes.SELECT,
    });
}
async function getMembersCount(seq) {
    const membersCountQuery = `
        select count(*) from members m
    `;
    const membersCount = (await seq.query(membersCountQuery, {
        type: sequelize_1.QueryTypes.SELECT,
    }))[0].count;
    return membersCount;
}
//# sourceMappingURL=2022-10-14-api-v1-remove-gitmeshUsername.js.map