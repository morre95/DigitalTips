import {RouteData} from "@/interfaces/common";

export function updateMarkerOrderForRoutes(
    routes: RouteData[],
    targetId: number,
    newOrder: number
): RouteData[] {
    // Skapa en kopia av arrayen och sortera utifrån marker.markerOrder
    const sortedRoutes = [...routes].sort((a, b) => a.marker.markerOrder - b.marker.markerOrder);

    // Hitta index för den RouteData som innehåller marker med targetId
    const currentIndex = sortedRoutes.findIndex(route => route.marker.id === targetId);
    if (currentIndex === -1) {
        throw new Error(`Marker med id ${targetId} hittades inte.`);
    }

    // Ta bort objektet som ska flyttas
    const [targetRoute] = sortedRoutes.splice(currentIndex, 1);

    // Beräkna nytt index utifrån newOrder (notera att newOrder börjar på 1)
    const newIndex = Math.max(0, Math.min(newOrder - 1, sortedRoutes.length));

    // Infoga targetRoute på den nya positionen
    sortedRoutes.splice(newIndex, 0, targetRoute);

    // Uppdatera markerOrder för varje RouteData så att de blir sekventiella
    sortedRoutes.forEach((route, index) => {
        route.marker.markerOrder = index + 1;
    });

    return sortedRoutes;
}