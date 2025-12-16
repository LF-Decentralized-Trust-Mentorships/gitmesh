"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackOverflowRootStream = exports.StackOverflowActivityType = exports.STACKOVERFLOW_LAST_MAX_PAGES = exports.STACKOVERFLOW_MAX_RETROSPECT_IN_HOURS = void 0;
exports.STACKOVERFLOW_MAX_RETROSPECT_IN_HOURS = 5;
exports.STACKOVERFLOW_LAST_MAX_PAGES = 20;
var StackOverflowActivityType;
(function (StackOverflowActivityType) {
    StackOverflowActivityType["QUESTION"] = "question";
    StackOverflowActivityType["ANSWER"] = "answer";
})(StackOverflowActivityType || (exports.StackOverflowActivityType = StackOverflowActivityType = {}));
var StackOverflowRootStream;
(function (StackOverflowRootStream) {
    StackOverflowRootStream["QUESTIONS_BY_TAG"] = "questions_by_tag";
    StackOverflowRootStream["QUESTIONS_BY_KEYWORD"] = "questions_by_keyword";
    StackOverflowRootStream["ANSWERS_TO_QUESTION"] = "answers_to_question";
})(StackOverflowRootStream || (exports.StackOverflowRootStream = StackOverflowRootStream = {}));
//# sourceMappingURL=types.js.map