import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    if (!location) {
      return NextResponse.json({ error: 'Location parameter required' }, { status: 400 });
    }

    // Get API key from server-side environment variables (no NEXT_PUBLIC_ prefix)
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      console.log("Weather API key not found");
      return NextResponse.json({ error: 'Weather API not configured' }, { status: 500 });
    }

    // Make the API call server-side
    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`;
    
    const response = await fetch(weatherUrl);

    if (!response.ok) {
      console.log(`Weather API error: ${response.status}`);
      return NextResponse.json({ error: 'Weather API error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error in weather API route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
