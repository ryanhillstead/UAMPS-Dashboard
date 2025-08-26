import { NextRequest, NextResponse } from 'next/server';

// Configuration for each facility
const FACILITIES = {
  0: { name: "Horse Butte Wind", pointName: "020 UAMPS HBW1 RTAC TP1\\UAMPS HBW RTAC TP1\\HBW\\HBW Meter\\Calculations\\WattsREC:Value" },
  1: { name: "Hunter", pointName: "009 UAMPS Nebo 13_8 RTAC TP5\\UAMPS Nebo 13_8 RTAC TP5\\HunterII\\AnalogInputs\\PAC HunterII Net MW:Value" },  
  2: { name: "Nebo Power Plant", pointName: "007 UAMPS Nebo 13_8 RTAC TP3\\UAMPS Nebo 13_8 RTAC TP3\\Nebo Power Station\\Calculations\\Nebo Net:Value" },
  3: { name: "Red Mesa Solar", pointName: "008 UAMPS Nebo 13_8 RTAC TP4\\UAMPS Nebo 13_8 RTAC TP4\\NTUA\\Red Mesa Solar\\AnalogInputs\\WattsREC:Value" },
  4: { name: "Steel", pointName: "002 UAMPS Main RTAC TP2\\UAMPS Main RTAC TP2\\Steel Solar\\Steel Solar PAC\\Calculations\\MWREC:Value" },
  5: { name: "Veyo Heat Recovery", pointName: "030 UAMPS Veyo RTAC TP1\\UAMPS Veyo RTAC TP1\\Veyo\\Veyo Check Meter\\AnalogInputs\\WattsREC:Value" } 
};

// Types for the processed chart data
interface ChartData {
  time: string;
  generation: number;
  timestamp: number; // Add Unix timestamp for caching logic
}

// Function to process VTScada API response into 5-minute intervals
function processChartData(apiResponse: any, facilityId: number, isIncremental: boolean = false): ChartData[] {
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
    let generationValue = row[1];
    
    // Round down to nearest 5-minute interval (300 seconds)
    const intervalStart = Math.floor(unixTimestamp / 300) * 300;
    
    if (!intervalMap.has(intervalStart)) {
      intervalMap.set(intervalStart, []);
    }
    // Include zero values - only exclude null/undefined and negative values
    if (generationValue !== null && generationValue !== undefined) {
      if(generationValue < 0) {
        generationValue = generationValue * -1;
      }
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
      generation: Math.max(0, Math.round((facilityId === 1 || facilityId === 2 || facilityId === 4 ? averageValue : averageValue/1000000) * 100) / 100), // Ensure non-negative
      timestamp: intervalStart, // Store Unix timestamp for caching
    });
  });

  return chartData;
}

// Function to process VTScada API response into raw data points (no averaging)
function processRawChartData(apiResponse: any, facilityId: number): ChartData[] {
  // Check if we have a valid response structure
  if (!apiResponse || typeof apiResponse !== 'object') {
    console.log("Invalid API response structure for raw data");
    return generateZeroDataRaw();
  }

  // Handle case where values array is missing or empty
  if (!apiResponse.values || !Array.isArray(apiResponse.values) || apiResponse.values.length === 0) {
    console.log("No values in API response for raw data");
    return generateZeroDataRaw();
  }

  const chartData: ChartData[] = [];
  
  apiResponse.values.forEach((row: any[]) => {
    const unixTimestamp = row[0]; // Unix timestamp in seconds
    let generationValue = row[1];
    
    // Include zero values - only exclude null/undefined and negative values
    if (generationValue !== null && generationValue !== undefined) {
      if(generationValue < 0) {
        generationValue = generationValue * -1;
      }
      
      // Convert Unix timestamp to JavaScript Date
      const timestamp = new Date(unixTimestamp * 1000);
      
      chartData.push({
        time: timestamp.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true 
        }),
        generation: Math.max(0, Math.round((facilityId === 1 || facilityId === 2 || facilityId === 4 ? generationValue : generationValue/1000000) * 100) / 100), // Ensure non-negative and convert to MW
        timestamp: unixTimestamp, // Store Unix timestamp for caching
      });
    }
  });

  // Sort by timestamp
  chartData.sort((a, b) => a.timestamp - b.timestamp);

  // If no valid data was processed, return zero data
  if (chartData.length === 0) {
    console.log("No valid raw data points found - generating zero data");
    return generateZeroDataRaw();
  }

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

// Helper function to generate zero raw data points for the last 5 minutes
function generateZeroDataRaw(): ChartData[] {
  const chartData: ChartData[] = [];
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  // Generate data points every 30 seconds for the last 5 minutes
  for (let time = fiveMinutesAgo; time <= now; time += 30 * 1000) {
    const timestamp = new Date(time);
    const unixTimestamp = Math.floor(time / 1000);
    
    chartData.push({
      time: timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      }),
      generation: 0,
      timestamp: unixTimestamp,
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

    // Get credentials from environment variables
    const baseUrl = process.env.VTSCADA_BASE_URL;
    const username = process.env.VTSCADA_USERNAME;
    const password = process.env.VTSCADA_PASSWORD;

    if (!baseUrl || !username || !password) {
      console.log("VTScada credentials not found");
      return NextResponse.json({ error: 'VTScada credentials not configured' }, { status: 500 });
    }

    // Function to fetch all paginated data
    const fetchAllData = async (baseQuery: string): Promise<any> => {
      const allResults = { values: [] as any[] };
      let pageToken: string | null = null;
      let pageCount = 0;
      
      do {
        pageCount++;
        // Build URL with pagination token as separate parameter
        const url: string = pageToken 
          ? `${baseUrl}?query=${encodeURIComponent(baseQuery)}&PageToken=${pageToken}`
          : `${baseUrl}?query=${encodeURIComponent(baseQuery)}`;
        
        console.log(`Fetching page ${pageCount} for facility ${slideIndex}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.log(`VTScada API error: ${response.status}`);
          throw new Error(`VTScada API error: ${response.status}`);
        }

        const pageData = await response.json();
        console.log(pageData.nextPageToken);
        
        // Append values from this page to our results
        if (pageData.results && pageData.results.values) {
          allResults.values.push(...pageData.results.values);
          console.log(`Page ${pageCount}: Added ${pageData.results.values.length} data points`);
        }
        
        // Check for next page token
        pageToken = pageData.nextPageToken || null;
        //console.log(pageToken);
        if (pageToken) {
          console.log(`Next page token found, fetching page ${pageCount + 1}`);
        }
        
        // Safety check to prevent infinite loops
        if (pageCount > 50) {
          console.log("Too many pages, stopping pagination");
          break;
        }
        
      } while (pageToken);
      
      console.log(`Total pages fetched: ${pageCount}, Total data points: ${allResults.values.length}`);
      return { results: allResults };
    };

    const query = `select timestamp, \"${pointName}\" from history where timestamp >= ${startTime} and timestamp < ${endTime} order by timestamp asc`;

    // Fetch all paginated data
    const data = await fetchAllData(query);
    
    // Process the data into both averaged and raw formats
    const processedData = processChartData(data.results, slideIndex, isIncremental);
    const rawData = processRawChartData(data.results, slideIndex);
    
    return NextResponse.json({ 
      chartData: processedData,
      rawChartData: rawData,
      isIncremental,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error("Error in VTScada API route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
