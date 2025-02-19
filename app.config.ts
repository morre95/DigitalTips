
import { ExpoConfig, ConfigContext } from 'expo/config';


export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    slug: 'my-app',
    // TBD: slug och name måste vara med annars får jag felmmedelanden
    name: 'My App',

    ios: {
        ...config.ios,
        config: {
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS,
        },
    },

    android: {
        ...config.android,
        config: {
            googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
            },
        },
        package: 'myApp.com',
    },
});