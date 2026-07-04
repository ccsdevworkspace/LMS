export default {
    testEnvironment: 'node',
    transform: {
        '^.+\.ts?$': 'babel-jest',
    },
    moduleNameMapper: {
        '^(\.{1,2}/.*)\.js$': '$1',
    },
};