"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
function getEvent(char) {
    switch (char) {
        case '"':
            return { type: 'DOUBLE_QUOTE' };
        case "'":
            return { type: 'SINGLE_QUOTE' };
        case '\\':
            return { type: 'ESCAPE_CHARACTER' };
        case '/':
            return { type: 'SLASH' };
        case '\n':
        case '\r':
            return { type: 'NEWLINE' };
        default:
            return { type: 'REGULAR_CHARACTER' };
    }
}
function stripComments(text) {
    let i = 0;
    const fsm = xstate_1.Machine({
        initial: 'initial',
        context: {
            offset: 0,
            result: ''
        },
        states: {
            initial: {
                on: {
                    SINGLE_QUOTE: 'singleQuoteLiteral',
                    DOUBLE_QUOTE: 'doubleQuoteLiteral',
                    ESCAPE_CHARACTER: 'escaped',
                    SLASH: 'singleSlash',
                    END_OF_INPUT: { target: 'final', actions: 'appendResult' },
                    '*': 'initial'
                }
            },
            escaped: {
                on: {
                    END_OF_INPUT: { target: 'final', actions: 'appendResult' },
                    '*': 'initial'
                }
            },
            singleSlash: {
                on: {
                    END_OF_INPUT: { target: 'final', actions: 'appendResult' },
                    SLASH: {
                        target: 'comment',
                        actions: 'appendResultWithoutLastChar'
                    },
                    '*': 'initial'
                }
            },
            singleQuoteLiteral: {
                on: {
                    END_OF_INPUT: { target: 'final', actions: 'appendResult' },
                    ESCAPE_CHARACTER: 'escapedInSingleQuoteLiteral',
                    SINGLE_QUOTE: 'initial',
                    '*': 'singleQuoteLiteral'
                }
            },
            escapedInSingleQuoteLiteral: {
                on: {
                    END_OF_INPUT: { target: 'final', actions: 'appendResult' },
                    '*': 'singleQuoteLiteral'
                }
            },
            doubleQuoteLiteral: {
                on: {
                    END_OF_INPUT: { target: 'final', actions: 'appendResult' },
                    ESCAPE_CHARACTER: 'escapedInDoubleQuoteLiteral',
                    DOUBLE_QUOTE: 'initial',
                    '*': 'doubleQuoteLiteral'
                }
            },
            escapedInDoubleQuoteLiteral: {
                on: {
                    END_OF_INPUT: { target: 'final', actions: 'appendResult' },
                    '*': 'doubleQuoteLiteral'
                }
            },
            comment: {
                on: {
                    NEWLINE: { target: 'initial', actions: 'setOffsetToCurrent' },
                    END_OF_INPUT: 'final',
                    '*': 'comment'
                }
            },
            final: {
                type: 'final'
            }
        }
    }, {
        actions: {
            appendResult: xstate_1.assign({
                result: (context, event) => (context.result += text.slice(context.offset, i)),
                offset: context => i
            }),
            appendResultWithoutLastChar: xstate_1.assign({
                result: (context, event) => (context.result += text.slice(context.offset, i - 1)),
                offset: context => i
            }),
            setOffsetToCurrent: xstate_1.assign({ offset: context => i + 1 })
        }
    });
    const stateService = xstate_1.interpret(fsm);
    stateService.start();
    for (i = 0; i < text.length; ++i) {
        const event = getEvent(text[i]);
        stateService.send(event);
    }
    stateService.send('END_OF_INPUT');
    const result = stateService.state.context.result;
    stateService.stop();
    return result;
}
exports.stripComments = stripComments;
