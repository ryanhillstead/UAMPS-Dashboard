import { NextRequest, NextResponse } from 'next/server';

// Configuration for each facility
const FACILITIES = {
  0: { name: "Red Mesa Solar", pointName: "008 UAMPS Nebo 13_8 RTAC TP4\\UAMPS Nebo 13_8 RTAC TP4\\NTUA\\Red Mesa Solar\\AnalogInputs\\WattsREC:Value" },
  1: { name: "Veyo Heat Recovery", pointName: "030 UAMPS Veyo RTAC TP1\\UAMPS Veyo RTAC TP1\\Veyo\\Veyo Check Meter\\AnalogInputs\\WattsDEL:Value" },  
  2: { name: "Horse Butte Wind", pointName: "020 UAMPS HBW1 RTAC TP1\\UAMPS HBW RTAC TP1\\HBW\\HBW Meter\\Calculations\\WattsREC:Value" },
  //3: { name: "Hunter", pointName: "HUNTER_GENERATION" },
  //4: { name: "Steel", pointName: "STEEL_GENERATION" }
};

// Types for the processed chart data
interface ChartData {
  time: string;
  generation: number;
  timestamp: number; // Add Unix timestamp for caching logic
}

// Function to process VTScada API response into 5-minute intervals
function processChartData(apiResponse: any, isIncremental: boolean = false): ChartData[] {
  // Check if we have a valid response structure
  if (!apiResponse || typeof apiResponse !== 'object') {
    console.log("Invalid API response structure");
    if (isIncremental) {
      return generateZeroDataIncremental();
    }
    return generateZeroData();
  }

  // Handle case where values array is missing or empty
  if (!apiResponse.values || !Array.isArray(apiResponse.values) || apiResponse.values.length === 0) {
    console.log("No values in API response - generating zero data points");
    if (isIncremental) {
      // For incremental updates, only generate zeros for the recent period
      return generateZeroDataIncremental();
    }
    return generateZeroData();
  }

  // Group data by 5-minute intervals
  const intervalMap = new Map<number, number[]>();
  
  apiResponse.values.forEach((row: any[]) => {
    const unixTimestamp = row[0]; // Unix timestamp in seconds
    const generationValue = row[1];
    
    // Round down to nearest 5-minute interval (300 seconds)
    const intervalStart = Math.floor(unixTimestamp / 300) * 300;
    
    if (!intervalMap.has(intervalStart)) {
      intervalMap.set(intervalStart, []);
    }
    // Include zero values - only exclude null/undefined
    if (generationValue !== null && generationValue !== undefined) {
      intervalMap.get(intervalStart)!.push(generationValue);
    }
  });

  // If no valid data was processed, return zero data
  if (intervalMap.size === 0) {
    console.log("No valid data points found - generating zero data");
    if (isIncremental) {
      return generateZeroDataIncremental();
    }
    return generateZeroData();
  }

  // Convert to chart data with averaged values
  const chartData: ChartData[] = [];
  
  // Sort intervals by timestamp
  const sortedIntervals = Array.from(intervalMap.keys()).sort((a, b) => a - b);
  
  sortedIntervals.forEach(intervalStart => {
    const values = intervalMap.get(intervalStart)!;
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Convert Unix timestamp to JavaScript Date
    const timestamp = new Date(intervalStart * 1000);
    
    chartData.push({
      time: timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      generation: Math.round((averageValue / 1000000) * 1000) / 1000, // Convert to MW and round to 3 decimal places
      timestamp: intervalStart, // Store Unix timestamp for caching
    });
  });

  return chartData;
}

// Helper function to generate zero data points for incremental updates (only last 10 minutes)
function generateZeroDataIncremental(): ChartData[] {
  const chartData: ChartData[] = [];
  const now = Date.now();
  const tenMinutesAgo = now - (10 * 60 * 1000);
  
  // Generate data points every 5 minutes for the last 10 minutes
  for (let time = tenMinutesAgo; time <= now; time += 5 * 60 * 1000) {
    const timestamp = new Date(time);
    const intervalStart = Math.floor(time / 1000 / 300) * 300;
    
    chartData.push({
      time: timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      generation: 0,
      timestamp: intervalStart,
    });
  }
  
  return chartData;
}

// Helper function to generate zero data points for the last 6 hours (full load only)
function generateZeroData(): ChartData[] {
  const chartData: ChartData[] = [];
  const now = Date.now();
  const sixHoursAgo = now - (6 * 60 * 60 * 1000);
  
  // Generate data points every 5 minutes (300 seconds) for the last 6 hours
  for (let time = sixHoursAgo; time <= now; time += 5 * 60 * 1000) {
    const timestamp = new Date(time);
    const intervalStart = Math.floor(time / 1000 / 300) * 300; // 5-minute intervals
    
    chartData.push({
      time: timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      generation: 0, // Zero generation
      timestamp: intervalStart,
    });
  }
  
  return chartData;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slideIndex = parseInt(searchParams.get('slideIndex') || '0');
    const isIncremental = searchParams.get('incremental') === 'true';

    // Get facility info for this slide
    const facility = FACILITIES[slideIndex as keyof typeof FACILITIES];
    if (!facility) {
      return NextResponse.json({ error: 'Invalid facility' }, { status: 400 });
    }

    // Build the VTScada query with Unix timestamps
    const pointName = facility.pointName;
    const endTimeMs = Date.now();
    
    let startTimeMs: number;
    if (isIncremental) {
      // For incremental updates, get last 10 minutes (to ensure we don't miss any data)
      startTimeMs = endTimeMs - (10 * 60 * 1000);
    } else {
      // For initial load, get last 6 hours
      startTimeMs = endTimeMs - (6 * 60 * 60 * 1000);
    }
    
    // Convert to Unix timestamps (seconds) for the database query
    const endTime = Math.floor(endTimeMs / 1000);
    const startTime = Math.floor(startTimeMs / 1000);
    
    const query = `select timestamp, \"${pointName}\" from history where timestamp >= ${startTime} and timestamp < ${endTime} order by timestamp asc`;
    const encodedQuery = encodeURIComponent(query);

    // Get credentials from environment variables
    const baseUrl = process.env.VTSCADA_BASE_URL;
    const username = process.env.VTSCADA_USERNAME;
    const password = process.env.VTSCADA_PASSWORD;

    if (!baseUrl || !username || !password) {
      console.log("VTScada credentials not found");
      return NextResponse.json({ error: 'VTScada credentials not configured' }, { status: 500 });
    }

    const url = `${baseUrl}?query=${encodedQuery}`;

    // Make the API call (this runs server-side, so no CORS issues)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`VTScada API error: ${response.status}`);
      console.log(response);
      return NextResponse.json({ error: 'VTScada API error' }, { status: response.status });
    }

    const data = await response.json();
    
    // Process the data into 5-minute intervals and return processed chart data
    const processedData = processChartData(data.results, isIncremental);
    
    return NextResponse.json({ 
      chartData: processedData,
      isIncremental,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error("Error in VTScada API route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
