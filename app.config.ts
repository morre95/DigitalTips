
import { ExpoConfig, ConfigContext } from 'expo/config';

// TODO: om nycklarna inte laddas in som dom ska kör "eas update --environment preview" före "eas build -p android --profile preview"
export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    slug: 'my-app',
    name: 'Digital Tips',

    ios: {
        ...config.ios,
        config: {
            googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
        },
    },

    android: {
        ...config.android,
        config: {
            googleMaps: {
                apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
            },
        },
        package: 'myApp.com',
    },
});