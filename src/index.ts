import { Machine, interpret, assign } from 'xstate';

type Event =
    | { type: 'SINGLE_QUOTE' }
    | { type: 'DOUBLE_QUOTE' }
    | { type: 'ESCAPE_CHARACTER' }
    | { type: 'REGULAR_CHARACTER' }
    | { type: 'NEWLINE' }
    | { type: 'SLASH' }
    | { type: 'END_OF_INPUT' };

interface Context {
    offset: number;
    result: string;
}

interface States {
    states: {
        initial: {};
        escaped: {};
        singleSlash: {};
        singleQuoteLiteral: {};
        escapedInSingleQuoteLiteral: {};
        doubleQuoteLiteral: {};
        escapedInDoubleQuoteLiteral: {};
        comment: {};
        final: {};
    };
}

function getEvent(char: string): Event {
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

export function removeComments(text: string): string {
    let i = 0;

    const fsm = Machine<Context, States, Event>(
        {
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
        },
        {
            actions: {
                appendResult: assign({
                    result: (context, event) => (context.result += text.slice(context.offset, i)),
                    offset: context => i
                }),
                appendResultWithoutLastChar: assign({
                    result: (context, event) => (context.result += text.slice(context.offset, i - 1)),
                    offset: context => i
                }),
                setOffsetToCurrent: assign({ offset: context => i + 1 })
            }
        }
    );

    const stateService = interpret(fsm);
    stateService.start();
    for (i = 0; i < text.length; ++i) {
        const event = getEvent(text[i]);
        stateService.send(event);
    }

    stateService.send('END_OF_INPUT');

    const result = stateService.state.context.result;

    stateService.stop();

    return result.trim();
}
