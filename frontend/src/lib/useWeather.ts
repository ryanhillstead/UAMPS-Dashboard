import useSWR from 'swr';

// Types for WeatherAPI response
interface WeatherAPIResponse {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_f: number;
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    wind_kph: number;
    humidity: number;
    precip_in: number;
    precip_mm: number;
  };
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<WeatherAPIResponse> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  return response.json();
};

// Custom hook for weather data
export function useWeather(location: string, apiKey: string) {
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`;
  
  const { data, error, isLoading } = useSWR<WeatherAPIResponse>(
    location && apiKey ? url : null, // Only fetch if both location and apiKey are provided
    fetcher,
    {
      refreshInterval: 3600000, // Refresh every 1 hour
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedupe requests within 1 minute
    }
  );

  return {
    weather: data,
    isLoading,
    error,
  };
}

// Helper function to transform WeatherAPI data to your existing format
export function transformWeatherData(
  weatherData: WeatherAPIResponse,
  useFahrenheit: boolean = true
): {
  city: string;
  temp: string;
  condition: string;
  wind: string;
  humidity: string;
  precip: string;
  lastUpdate: string;
} {
  const temp = useFahrenheit ? weatherData.current.temp_f : weatherData.current.temp_c;
  const tempUnit = useFahrenheit ? '°F' : '°C';
  const windSpeed = useFahrenheit ? weatherData.current.wind_mph : weatherData.current.wind_kph;
  const windUnit = useFahrenheit ? 'mph' : 'kph';
  const precip = useFahrenheit ? weatherData.current.precip_in : weatherData.current.precip_mm;
  const precipUnit = useFahrenheit ? 'in' : 'mm';

  return {
    city: `${weatherData.location.name}, ${weatherData.location.region}`,
    temp: `${Math.round(temp)}${tempUnit}`,
    condition: weatherData.current.condition.text,
    wind: `${Math.round(windSpeed)} ${windUnit}`,
    humidity: `${weatherData.current.humidity}%`,
    precip: `${precip} ${precipUnit}`,
    lastUpdate: new Date(weatherData.location.localtime).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  };
}
