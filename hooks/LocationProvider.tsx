import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Location from 'expo-location';

// Typdefinition för kontextvärdet
interface LocationContextValue {
    userLocation: Location.LocationObject | null;
    errorMsg: string | null;
}

// Skapa Context
const LocationContext = createContext<LocationContextValue>({
    userLocation: null,
    errorMsg: null,
});

// Hook för att använda kontexten
export const useLocation = (): LocationContextValue => {
    return useContext(LocationContext);
};

// Provider-komponenten
interface LocationProviderProps {
    children: ReactNode;
}

let subscription: Location.LocationSubscription;

export const LocationProvider = ({ children }: LocationProviderProps) => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            // Be om tillstånd
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission denied to pick up location.');
                return;
            }

            subscription?.remove();
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation, //Location.Accuracy.High,
                    timeInterval: 1000,      // uppdatering varje sekund
                    distanceInterval: 10,     // eller var 10:e meter
                },
                (loc) => {
                    setLocation(loc);
                }
            );
        })();

        // Rensa subscription vid unmount
        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    return (
        <LocationContext.Provider value={{ userLocation: location, errorMsg }}>
            {children}
        </LocationContext.Provider>
    );
};
