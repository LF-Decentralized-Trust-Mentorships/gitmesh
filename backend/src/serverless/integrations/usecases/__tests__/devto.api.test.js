"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getOrganizationArticles_1 = require("../devto/getOrganizationArticles");
const getArticleComments_1 = require("../devto/getArticleComments");
const getUserArticles_1 = require("../devto/getUserArticles");
const getUser_1 = require("../devto/getUser");
function expectDefinedNumber(val) {
    expect(val).toBeDefined();
    expect(typeof val).toBe('number');
}
function expectDefinedString(val) {
    expect(val).toBeDefined();
    expect(typeof val).toBe('string');
}
function expectDefinedStringOrNull(val) {
    expect(val).toBeDefined();
    expect(typeof val === 'string' || val === null).toBeTruthy();
}
function expectDefinedArray(val) {
    expect(val).toBeDefined();
    expect(Array.isArray(val)).toBeTruthy();
}
describe('Devto API tests', () => {
    const organization = 'digitalocean';
    const organizationArticleId = 524804;
    const username = 'kukicado';
    const userId = 139953;
    it('Should return correct required properties when fetching organization articles', async () => {
        const articles = await (0, getOrganizationArticles_1.getOrganizationArticles)(organization, 1, 1);
        expect(articles.length).toEqual(1);
        const article = articles[0];
        expectDefinedNumber(article.id);
        expectDefinedString(article.title);
        expectDefinedString(article.description);
        expectDefinedString(article.readable_publish_date);
        expectDefinedArray(article.tag_list);
        expectDefinedString(article.slug);
        expectDefinedString(article.url);
        expectDefinedNumber(article.comments_count);
        expectDefinedString(article.published_at);
        expectDefinedString(article.last_comment_at);
    });
    it('Should return the correct required properties when fetching article comments', async () => {
        const comments = await (0, getArticleComments_1.getArticleComments)(organizationArticleId);
        expect(comments.length > 0).toBeTruthy();
        const comment = comments[0];
        expectDefinedString(comment.id_code);
        expectDefinedString(comment.created_at);
        expectDefinedString(comment.body_html);
        expectDefinedString(comment.body_html);
        expectDefinedArray(comment.children);
        expect(comment.user).toBeDefined();
        // check comment user properties
        expectDefinedNumber(comment.user.user_id);
        expectDefinedString(comment.user.name);
        expectDefinedString(comment.user.username);
        expectDefinedStringOrNull(comment.user.twitter_username);
        expectDefinedStringOrNull(comment.user.github_username);
        expectDefinedStringOrNull(comment.user.website_url);
        expectDefinedString(comment.user.profile_image);
        expectDefinedString(comment.user.profile_image_90);
    });
    it('Should return the correct required properties when fetching user articles', async () => {
        const articles = await (0, getUserArticles_1.getUserArticles)(username, 1, 1);
        expect(articles.length).toEqual(1);
        const article = articles[0];
        expectDefinedNumber(article.id);
        expectDefinedString(article.title);
        expectDefinedString(article.description);
        expectDefinedString(article.readable_publish_date);
        expectDefinedArray(article.tag_list);
        expectDefinedString(article.slug);
        expectDefinedString(article.url);
        expectDefinedNumber(article.comments_count);
        expectDefinedString(article.published_at);
        expectDefinedString(article.last_comment_at);
    });
    it('Should return the correct required properties when fetching a user', async () => {
        const user = await (0, getUser_1.getUserById)(userId);
        expectDefinedNumber(user.id);
        expectDefinedString(user.name);
        expectDefinedString(user.username);
        expectDefinedStringOrNull(user.twitter_username);
        expectDefinedStringOrNull(user.github_username);
        expectDefinedStringOrNull(user.website_url);
        expectDefinedStringOrNull(user.location);
        expectDefinedStringOrNull(user.summary);
        expectDefinedString(user.profile_image);
    });
});
//# sourceMappingURL=devto.api.test.js.map