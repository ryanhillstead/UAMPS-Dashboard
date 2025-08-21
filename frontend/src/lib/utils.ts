import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Transform function remains the same
export function transformWeatherData(data: WeatherAPIResponse) {
  if (!data || !data.current || !data.location) {
    return null;
  }

  const formatTime = (localtime: string) => {
    try {
      const date = new Date(localtime);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Unknown';
    }
  };

  return {
    city: `${data.location.name}, ${data.location.region}`,
    temp: `${Math.round(data.current.temp_f)}°F`,
    condition: data.current.condition.text,
    wind: `${Math.round(data.current.wind_mph)} mph`,
    humidity: `${data.current.humidity}%`,
    precip: `${data.current.precip_in}"`,
    lastUpdate: formatTime(data.location.localtime),
    icon: data.current.condition.icon.replace('64x64', '128x128'), // Use larger icon
  };
}