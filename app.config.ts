import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    slug: 'my-app',
    // TBD: slug och name måste vara med annars får jag felmmedelanden
    name: 'My App',

    ios: {
        ...config.ios,
        config: {
            googleMapsApiKey: 'YOUR_GOOGLE_MAP_API_KEY_HERE',
        },
    },

    android: {
        ...config.android,
        config: {
            googleMaps: {
                apiKey: 'YOUR_GOOGLE_MAP_API_KEY_HERE',
            },
        },
    },
});