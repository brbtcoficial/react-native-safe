module.exports = {
    dependency: {
        platforms: {
            /**
             * @type {import('@react-native-community/cli-types').IOSDependencyParams}
             */
            ios: {},
            /**
             * @type {import('@react-native-community/cli-types').AndroidDependencyParams}
             */
            android: {
                sourceDir: './android',
                packageImportPath: 'import br.com.b8.safe.B8SafePackage;',
                packageInstance: 'new B8SafePackage()',
            },
        }
    },
};