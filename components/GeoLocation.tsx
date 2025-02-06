import * as Location from 'expo-location';

export async function getLocation() {
  const {status} = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
  }

  const location = await Location.getCurrentPositionAsync({});

  let coords = { 
      latitude : location.coords.latitude,
      longitude : location.coords.longitude
  }
  
  return coords;
}