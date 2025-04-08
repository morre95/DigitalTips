
import * as SecureStore from 'expo-secure-store';

export interface IProgressData {
    routeId: number;
    numberOfCheckpoints: number;
    currentCheckpoint?: number;
}

const key = "sj6fD8xt0u7toUljYY9wKqXnRfUa4Vlp";
export const setProgress = async (data: IProgressData | null): Promise<void> => {
    if (!data) {
        await SecureStore.deleteItemAsync(key);
    } else {
        await SecureStore.setItemAsync(key, JSON.stringify(data));
    }
}

export const increaseProgress = async (routeId: number): Promise<IProgressData | null> => {
    const progress = await getProgress(routeId);
    if (!progress) {
        return null
    }
    progress.numberOfCheckpoints++;

    await setProgress(progress);
    return progress;
}

export const getProgress = async (routeId: number): Promise<IProgressData | null> => {
    const json = await SecureStore.getItemAsync(key);
    if (!json) {
        return null
    }

    const progress = JSON.parse(json) as IProgressData;
    if (progress.routeId !== routeId) {
        return null;
    }

    return progress;
}