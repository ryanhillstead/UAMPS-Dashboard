"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "./button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "../ui/carousel";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer } from "../ui/chart";
import { transformWeatherData } from "../../lib/utils";

import { useState, useEffect, useRef } from "react";

// Types for slide data
interface WeatherData {
  city: string;
  temp: string;
  condition: string;
  wind: string;
  humidity: string;
  precip: string;
  lastUpdate: string;
  icon?: string; // Add icon field
}

interface GenerationData {
  generation: string;
  efficiency: string;
  uptime: string;
}

interface SlideData {
  description: string[];
  weather: WeatherData;
  generation: GenerationData;
  chartData: Array<{ time: string; generation: number }>;
}

const chartConfig = {
  generation: {
    label: "Generation",
    color: "#39ff14",
  },
  time: {
    label: "Time",
    color: "#39ff14",
  },
};

// Carousel Slide Content Component
interface CarouselSlideContentProps {
  slide: SlideData;
  chartData: Array<{ time: string; generation: number }>; // Add chartData prop
  isLoading?: boolean; // Add isLoading prop
}

function CarouselSlideContent({
  slide,
  chartData,
  isLoading,
}: CarouselSlideContentProps) {
  return (
    <main className="z-10 grid grid-cols-[2fr_2fr_2fr_0.08fr_2fr_2fr_2fr_2fr_2fr] grid-rows-[1fr_1fr_1fr_1fr_1fr] gap-4 w-full h-full">
      {/* Div 1 - Description */}
      <div className="col-span-9 col-start-1">
        <Card className="h-full">
          <CardContent className=" text-md 4k:text-6xl h-full overflow-auto">
            {slide.description.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Div 2 - Current Weather Card */}
      <div className="col-span-2 row-span-3 col-start-1 row-start-2">
        <Card className="h-full">
          <CardContent className="h-full flex flex-col justify-between">
            <div>
              <span className="font-semibold 4k:text-4xl">
                {slide.weather.city}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-5xl font-bold 4k:text-8xl">
                {slide.weather.temp}
              </div>
              <div className="text-4xl 4k:text-7xl">
                {slide.weather.icon ? (
                  <img
                    src={slide.weather.icon}
                    alt={slide.weather.condition}
                    className="w-16 h-16 4k:w-24 4k:h-24"
                  />
                ) : // Fallback emoji if no icon available
                slide.weather.condition === "Sunny" ? (
                  "☀️"
                ) : (
                  "🌥️"
                )}
              </div>
            </div>
            <div className="text-xl 4k:text-5xl">{slide.weather.condition}</div>
            <div className="text-right text-sm 4k:text-4xl text-gray-600">
              Last Update: <br /> {slide.weather.lastUpdate}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Div 3 - Wind */}
      <div className="col-start-3 row-start-2">
        <Card className="h-full shadow-lg">
          <CardContent className="text-center h-full flex flex-col justify-center">
            <div className="text-gray-600 mb-1 4k:text-3xl flex items-center justify-left gap-2">
              <img
                src="/Icons/windy.png"
                alt="Wind"
                className="w-4 h-4 4k:w-8 4k:h-8"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(75%)",
                }}
              />
              Wind Speed
            </div>
            <div className="font-semibold text-lg 4k:text-4xl">
              {slide.weather.wind}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Div 4 - Humidity */}
      <div className="col-start-3 row-start-3">
        <Card className="h-full shadow-lg">
          <CardContent className="text-center h-full flex flex-col justify-center">
            <div className="text-gray-600 mb-1 4k:text-3xl flex items-center justify-left gap-2">
              <img
                src="/Icons/humidity.png"
                alt="Humidity"
                className="w-4 h-4 4k:w-8 4k:h-8"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(75%)",
                }}
              />
              Humidity
            </div>
            <div className="font-semibold text-lg 4k:text-4xl">
              {slide.weather.humidity}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Div 5 - Precipitation */}
      <div className="col-start-3 row-start-4">
        <Card className="h-full shadow-lg">
          <CardContent className="text-center h-full flex flex-col justify-center">
            <div className="text-gray-600 mb-1 4k:text-3xl flex items-center justify-left gap-2">
              <img
                src="/Icons/rain.png"
                alt="Precipitation"
                className="w-4 h-4 4k:w-8 4k:h-8"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(75%)",
                }}
              />
              Precipitation
            </div>
            <div className="font-semibold text-lg 4k:text-4xl">
              {slide.weather.precip}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Div 6 - Vertical Separator */}
      <div className="row-span-3 col-start-4 row-start-2 flex items-center justify-center bg-card rounded-lg"></div>

      {/* Div 7 - Generation */}
      <div className="col-start-5 row-start-2">
        <Card className="h-full backdrop-blur-md border-0 shadow-lg">
          <CardContent className="text-center h-full flex flex-col justify-center">
            <div className="text-gray-600 mb-1 4k:text-3xl flex items-center justify-left gap-2">
              <img
                src="/Icons/electricity-icon-png-4541.png"
                alt="Generation"
                className="w-4 h-4 4k:w-8 4k:h-8"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(75%)",
                }}
              />
              Generation
            </div>
            <div className="font-semibold text-xl 4k:text-5xl">
              {slide.generation.generation}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Div 8 - Efficiency */}
      <div className="col-start-5 row-start-3">
        <Card className="h-full backdrop-blur-md border-0 shadow-lg">
          <CardContent className="text-center h-full flex flex-col justify-center">
            <div className="text-gray-600 mb-1 4k:text-5xl">Efficiency</div>
            <div className="font-semibold text-xl 4k:text-5xl">
              {slide.generation.efficiency}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Div 9 - Uptime */}
      <div className="col-start-5 row-start-4">
        <Card className="h-full backdrop-blur-md border-0 shadow-lg">
          <CardContent className="text-center h-full flex flex-col justify-center">
            <div className="text-gray-600 mb-1 4k:text-5xl">Uptime</div>
            <div className="font-semibold text-xl 4k:text-5xl">
              {slide.generation.uptime}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Div 10 - Chart - use the passed chartData */}
      <div className="col-span-4 row-span-3 col-start-6 row-start-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              MW Generation (Last 6 Hours)
              {isLoading && (
                <span className="text-sm text-gray-500 ml-2">(Loading...)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-3rem)]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart
                width={516}
                height={248}
                data={chartData}
                margin={{
                  top: 0,
                  left: -10,
                  right: 12,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  dataKey="generation"
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                />
                <Area
                  dataKey="generation"
                  type="natural"
                  fill="var(--color-accent)"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function WeatherDashboard() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Define Zip Codes for each site
  const locations = [
    "84511", // Red Mesa Solar (Blanding near the location)
    "84782", // Veyo Heat Recovery
    "83427", // Horse Butte Wind
    "84513", // Hunter
    "84330", // Steel Solar
  ];

  // Add this at the top of the WeatherDashboard component
  const [allWeatherData, setAllWeatherData] = useState<{ [key: string]: any }>(
    {}
  );
  // Replace useState with useRef for lastWeatherUpdate
  const lastWeatherUpdate = useRef(0);

  // Replace the useWeather call with this effect
  useEffect(() => {
    const fetchAllWeather = async () => {
      const now = Date.now();

      // Only fetch if 30 minutes have passed
      if (now - lastWeatherUpdate.current < 30 * 60 * 1000) return;

      lastWeatherUpdate.current = now; // Updates immediately

      try {
        const weatherPromises = locations.map(async (location) => {
          const response = await fetch(
            `/api/weather?location=${encodeURIComponent(location)}`
          );
          if (response.ok) {
            const data = await response.json();
            return { location, data };
          }

          return null;
        });

        const results = await Promise.all(weatherPromises);
        const weatherMap: { [key: string]: any } = {};

        results.forEach((result) => {
          if (result) {
            weatherMap[result.location] = result.data;
          }
        });

        setAllWeatherData(weatherMap);
        lastWeatherUpdate.current = now; // Set at the end
      } catch (error) {
        console.log("Error fetching weather:", error);
      }
    };

    // Fetch initially and then every 30 minutes
    fetchAllWeather();
  }, [current]);

  // Add VTScada state and ref
  const [allVTScadaData, setAllVTScadaData] = useState<{ [key: number]: any }>(
    {}
  );
  const lastVTScadaUpdate = useRef(0);

  // Add this useEffect for VTScada data
  useEffect(() => {
    const fetchAllVTScada = async () => {
      const now = Date.now();

      // Only fetch if 5 minutes have passed
      if (now - lastVTScadaUpdate.current < 5 * 60 * 1000) return;

      lastVTScadaUpdate.current = now;

      try {
        // Fetch data for all active facilities (0, 1, 2)
        const vtscadaPromises = [0, 1, 2].map(async (slideIndex) => {
          // Check if we have cached data for this slide
          const existingData = allVTScadaData[slideIndex] || [];
          const hasExistingData = existingData.length > 0;

          // Use incremental if we have existing data, full if we don't
          const isIncremental = hasExistingData;
          const url = `/api/vtscada?slideIndex=${slideIndex}${
            isIncremental ? "&incremental=true" : ""
          }`;

          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            return { slideIndex, data: data.chartData, isIncremental };
          }
          return null;
        });

        const results = await Promise.all(vtscadaPromises);
        const vtscadaMap: { [key: number]: any } = {};

        results.forEach((result) => {
          if (result) {
            if (result.isIncremental) {
              // Merge incremental data with existing data
              const existingData = allVTScadaData[result.slideIndex] || [];
              const newData = result.data || [];

              // Create a map to merge data by timestamp
              const dataMap = new Map();
              const now = Date.now() / 1000;
              const sixHoursAgo = now - 6 * 60 * 60;

              // Add existing data (only keep last 6 hours)
              existingData.forEach((item: any) => {
                if (item.timestamp >= sixHoursAgo) {
                  dataMap.set(item.timestamp, item);
                }
              });

              // Add new data (will overwrite duplicates)
              newData.forEach((item: any) => {
                if (item.timestamp >= sixHoursAgo) {
                  dataMap.set(item.timestamp, item);
                }
              });

              // Convert back to array and sort by timestamp
              const mergedData = Array.from(dataMap.values()).sort(
                (a: any, b: any) => a.timestamp - b.timestamp
              );

              vtscadaMap[result.slideIndex] = mergedData;
            } else {
              // Full data replacement
              vtscadaMap[result.slideIndex] = result.data;
            }
          }
        });

        setAllVTScadaData((prevData) => ({
          ...prevData,
          ...vtscadaMap,
        }));
        lastVTScadaUpdate.current = now; // Set at the end
      } catch (error) {
        console.log("Error fetching VTScada data:", error);
      }
    };

    // Fetch initially
    fetchAllVTScada();
  }, [current]);

  useEffect(() => {
    console.log("Changing on slide change", current);
  }, [current]);

  // Use the cached weather data instead of useWeather
  const currentLocation = locations[current] || locations[0];
  const weatherData = allWeatherData[currentLocation];
  const weatherLoading = !weatherData;
  const weatherError = null;

  // Replace useChartData with cached VTScada data
  const chartData = allVTScadaData[current] || [];
  const chartLoading = !chartData.length;
  const currentGeneration =
    chartData.length > 0
      ? `${chartData[chartData.length - 1]?.generation || 0} MW`
      : "N/A";

  // Button names corresponding to each slide
  const buttonNames = [
    "Red Mesa Solar",
    "Veyo Heat Recovery",
    "Horse Butte Wind",
    "Hunter Power Plant",
    "Steel Solar",
  ];

  // Background images corresponding to each slide
  const backgroundImages = [
    "/Blymyer_Projects_Red-Mesa_Utah_solar_utility.webp",
    "/UAMPS-Veyo-Recovered-Energy-Generation-3.webp",
    "/wind-farm.webp",
    "/hunter-plant-background.webp",
    "/steel-solar.webp",
  ];

  // Preload all background images
  React.useEffect(() => {
    backgroundImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      const newIndex = api.selectedScrollSnap();
      if (newIndex !== current) {
        setIsTransitioning(true);
        // Start transition immediately
        setCurrent(newIndex);
        // End transition after animation completes
        setTimeout(() => setIsTransitioning(false), 1500); // Slightly longer than CSS transition
      }
    });
  }, [api, current]);

  // Transform weather data or use fallback
  const currentWeather = React.useMemo(() => {
    if (weatherData && !weatherLoading && !weatherError) {
      const transformedData = transformWeatherData(weatherData);
      if (transformedData) {
        return transformedData;
      }
    }

    // Fallback weather data - always return a valid WeatherData object
    return {
      city: currentLocation || "Salt Lake City, UT",
      temp: weatherLoading ? "Loading..." : "N/A",
      condition: weatherLoading ? "Loading..." : "Unknown",
      wind: weatherLoading ? "..." : "N/A",
      humidity: weatherLoading ? "..." : "N/A",
      precip: weatherLoading ? "..." : "N/A",
      lastUpdate: weatherError ? "Error loading weather" : "Loading...",
      icon: undefined, // No icon for fallback data
    };
  }, [weatherData, weatherLoading, weatherError, currentLocation]);

  const slides: SlideData[] = [
    {
      description: [
        "The Red Mesa Tapaha Solar Project is a 72 MW (AC) solar photovoltaic facility on Navajo Nation land in southeastern Utah. It began commercial operations in spring 2023 following construction starting mid-2022.",
        "Spanning about 500 acres, it produces around 72 megawatts (AC) of clean power—enough for tens of thousands of homes.",
        "The Navajo Tribal Utility Authority developed the project in partnership with UAMPS, which purchases about 66 MW under a 25-year agreement, while 6 MW stays on the reservation to power Navajo communities.",
      ],
      weather: currentWeather, // Use dynamic weather data
      generation: {
        generation: currentGeneration, // Use dynamic current generation
        efficiency: "98.5%",
        uptime: "24/7",
      },
      chartData: chartData,
    },
    {
      description: [
        "The Veyo Heat Recovery Project uses waste heat to power a 7.8 MW energy recovery generation system.",
        "The Project is located adjacent to the existing Veyo Compressor Station which is owned and operated by the Kern River Gas Transmission Company.",
        "The Project began commercial operation in May 2016.",
      ],
      weather: currentWeather, // Use dynamic weather data
      generation: {
        generation: currentGeneration, // Use dynamic current generation
        efficiency: "95%",
        uptime: "24/7",
      },
      chartData: chartData,
    },
    {
      description: [
        "The Horse Butte Wind Project is a 57.6 MW wind farm comprised of 32 Vestas V-100 1.8 MW wind turbines and related facilities and equipment.",
        "The facility is located approximately 16 miles east of the City of Idaho Falls and commenced commercial operation in August 2012.",
        "The project provides UAMPS members with a long-term supply of renewable electric energy and associated environmental attributes.",
      ],
      weather: currentWeather, // Use dynamic weather data
      generation: {
        generation: currentGeneration, // Use dynamic current generation
        efficiency: "98.5%",
        uptime: "24/7",
      },
      chartData: chartData,
    },
  ];

  return (
    <div className="relative bg-gray-300 flex flex-col min-h-screen overflow-hidden">
      {/* Background Images with smooth crossfade */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              index === current ? "opacity-60" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "transparent",
            }}
          />
        ))}
      </div>

      <div className="mx-[8vh] my-[6vh] 4k:mx-[8vh] 4k:my-[8vh] z-10 relative">
        {/* Header - Scalable */}
        <header>
          <div className="font-sans text-lg text-right tv:text-3xl 4k:text-6xl ">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <div className="flex flex-row justify-between pb-6 4k:mb-15">
            <img
              src="/UAMPS_logo with icons.svg"
              alt="UAMPS Logo"
              className="w-1/8 4k:w-1/8"
            />
            <div className="flex flex-wrap justify-center items-center gap-4 4k:gap-10">
              {buttonNames.map((name, index) => (
                <Button
                  key={name}
                  size="lg"
                  className={`h-10 w-40 tv:w-40 4k:w-lg 4k:h-20 transition-all duration-300 ${
                    current === index ? "bg-primary text-white" : "bg-card"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                >
                  <div className="text-lg 4k:text-6xl">{name}</div>
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content Carousel */}
        <Carousel
          setApi={setApi}
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
          className="w-full"
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-[70vh] 4k:h-[80vh]">
                <CarouselSlideContent
                  slide={slide}
                  chartData={
                    index === current ? chartData : []
                  } /* Only pass data to current slide */
                  isLoading={chartLoading} /* Show loading state */
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation - Scalable positioning and size */}
          <CarouselPrevious className="hidden"></CarouselPrevious>
          <CarouselNext className="hidden"></CarouselNext>
        </Carousel>
      </div>
    </div>
  );
}

// Export the slide content component for reuse
export {
  CarouselSlideContent,
  type SlideData,
  type WeatherData,
  type GenerationData,
};
