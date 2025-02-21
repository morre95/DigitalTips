
import { ExpoConfig, ConfigContext } from 'expo/config';

// FIXME: denna laddar inte in process.env när man bygger med: "eas build -p android --profile preview"
export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    slug: 'my-app',
    // TBD: slug och name måste vara med annars får jag felmmedelanden
    name: 'My App',

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