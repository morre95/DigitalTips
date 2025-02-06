export async function fetchCityName(latitude: string, longitude: string) {
  let cityName: string = "";

  // TODO: Change the url to not contain the api key
  const url = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    
    if(json.address){
      cityName = json.address.city || json.address.town || json.address.village || "Unknown";
      return cityName;
    } else {
      console.warn("No address information found in the response");
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred", error);
    }
  }

  return "Unknown";
}
