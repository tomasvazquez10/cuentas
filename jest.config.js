module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@models/(.*)$': '<rootDir>/src/types/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@navigators/(.*)$': '<rootDir>/src/navigators/$1',
    '^@queries/(.*)$': '<rootDir>/src/queries/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '\\.(png|jpg|jpeg|gif|ttf)$': '<rootDir>/jest-file-mock.js',
  },
};
