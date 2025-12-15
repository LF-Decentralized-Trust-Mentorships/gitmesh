"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledRepositories = void 0;
const logging_1 = require("@gitmesh/logging");
const axios_1 = __importDefault(require("axios"));
const conf_1 = require("../../../../../conf");
const IS_GITHUB_COMMIT_DATA_ENABLED = conf_1.GITHUB_CONFIG.isCommitDataEnabled === 'true';
const log = (0, logging_1.getServiceChildLogger)('getInstalledRepositories');
const getRepositoriesFromGH = async (page, installToken) => {
    const REPOS_PER_PAGE = 100;
    const requestConfig = {
        method: 'get',
        url: `https://api.github.com/installation/repositories?page=${page}&per_page=${REPOS_PER_PAGE}`,
        headers: {
            Authorization: `Bearer ${installToken}`,
        },
    };
    const response = await (0, axios_1.default)(requestConfig);
    return response.data;
};
const parseRepos = (repositories) => {
    const repos = [];
    for (const repo of repositories) {
        repos.push({
            url: repo.html_url,
            owner: repo.owner.login,
            createdAt: repo.created_at,
            name: repo.name,
            fork: repo.fork,
            private: repo.private,
            cloneUrl: repo.clone_url,
        });
    }
    return repos;
};
const getInstalledRepositories = async (installToken) => {
    try {
        let page = 1;
        let hasMorePages = true;
        const repos = [];
        while (hasMorePages) {
            const data = await getRepositoriesFromGH(page, installToken);
            if (data.repositories) {
                repos.push(...parseRepos(data.repositories));
            }
            hasMorePages = data.total_count && data.total_count > 0 && data.total_count > repos.length;
            page += 1;
        }
        return repos.filter((repo) => !IS_GITHUB_COMMIT_DATA_ENABLED || !(repo.fork || repo.private));
    }
    catch (err) {
        log.error(err, 'Error fetching installed repositories!');
        throw err;
    }
};
exports.getInstalledRepositories = getInstalledRepositories;
//# sourceMappingURL=getInstalledRepositories.js.map