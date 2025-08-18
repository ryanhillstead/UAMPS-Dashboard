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

import { Separator } from "../ui/separator";

import {
  LineChart,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent } from "../ui/chart";
import Image from "next/image";
import { useWeather, transformWeatherData } from "../../lib/useWeather";

// Types for slide data
interface WeatherData {
  city: string;
  temp: string;
  condition: string;
  wind: string;
  humidity: string;
  precip: string;
  lastUpdate: string;
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
}

// Chart data (you can move this to props or context if needed)
const data = [
  { time: "12:00 AM", generation: 50 },
  { time: "1:00 AM", generation: 52 },
  { time: "2:00 AM", generation: 55 },
  { time: "3:00 AM", generation: 53 },
  { time: "4:00 AM", generation: 56 },
  { time: "5:00 AM", generation: 58 },
  { time: "6:00 AM", generation: 60 },
  { time: "7:00 AM", generation: 62 },
  { time: "8:00 AM", generation: 64 },
  { time: "9:00 AM", generation: 66 },
  { time: "10:00 AM", generation: 68 },
  { time: "11:00 AM", generation: 70 },
];

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
}

function CarouselSlideContent({ slide }: CarouselSlideContentProps) {
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
                {slide.weather.condition === "Sunny" ? "☀️" : "🌥️"}
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
            <div className="text-gray-600 mb-1 4k:text-3xl">Wind</div>
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
            <div className="text-gray-600 mb-1 4k:text-3xl">Humidity</div>
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
            <div className="text-gray-600 mb-1 4k:text-3xl">Precip</div>
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
            <div className="text-gray-600 mb-1 4k:text-5xl">Generation</div>
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

      {/* Div 10 - Chart */}
      <div className="col-span-4 row-span-3 col-start-6 row-start-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>MW Generation (Last 12 Hours)</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-3rem)]">
            {/* 👆 ensures CardContent fills available space after header */}
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
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
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis
                    dataKey="generation"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <Area
                    dataKey="generation"
                    type="natural"
                    fill="var(--color-accent)"
                    stroke="var(--color-accent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
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

  // Weather API configuration
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";

  // Define locations for each slide
  const locations = [
    "Blanding, UT", // Red Mesa Solar (near the location)
    "Veyo, UT", // Veyo Heat Recovery
    "Idaho Falls, ID", // Horse Butte Wind
    "Salt Lake City, UT", // Hunter (fallback)
    "Salt Lake City, UT", // Steel (fallback)
  ];

  // Fetch weather for current slide location
  const {
    weather: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
  } = useWeather(locations[current] || locations[0], apiKey);

  // Button names corresponding to each slide
  const buttonNames = [
    "Red Mesa Solar",
    "Veyo Heat Recovery",
    "Horse Butte Wind",
    "Hunter",
    "Steel",
  ];

  // Background images corresponding to each slide
  const backgroundImages = [
    "/Blymyer_Projects_Red-Mesa_Utah_solar_utility.webp",
    "/UAMPS-Veyo-Recovered-Energy-Generation-3.jpg",
    "/wind-farm.jpg",
    "/hunter-plant-background.webp",
    "/steel-plant-background.webp",
  ];

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Transform weather data or use fallback
  const currentWeather = React.useMemo(() => {
    if (weatherData && !weatherLoading && !weatherError) {
      return transformWeatherData(weatherData);
    }

    // Fallback weather data
    return {
      city: locations[current] || "Salt Lake City, UT",
      temp: weatherLoading ? "Loading..." : "N/A",
      condition: weatherLoading ? "Loading..." : "Unknown",
      wind: weatherLoading ? "..." : "N/A",
      humidity: weatherLoading ? "..." : "N/A",
      precip: weatherLoading ? "..." : "N/A",
      lastUpdate: weatherError ? "Error loading weather" : "Loading...",
    };
  }, [weatherData, weatherLoading, weatherError, current, locations]);

  const slides: SlideData[] = [
    {
      description: [
        "The Red Mesa Tapaha Solar Project is a 72 MW (AC) solar photovoltaic facility on Navajo Nation land in southeastern Utah. It began commercial operations in spring 2023 following construction starting mid-2022.",
        "Spanning about 500 acres, it produces around 72 megawatts (AC) of clean power—enough for tens of thousands of homes.",
        "The Navajo Tribal Utility Authority developed the project in partnership with UAMPS, which purchases about 66 MW under a 25-year agreement, while 6 MW stays on the reservation to power Navajo communities.",
      ],
      weather: currentWeather, // Use dynamic weather data
      generation: {
        generation: "62.5 MW",
        efficiency: "98.5%",
        uptime: "24/7",
      },
    },
    {
      description: [
        "The Veyo Heat Recovery Project uses waste heat to power a 7.8 MW energy recovery generation system.",
        "The Project is located adjacent to the existing Veyo Compressor Station which is owned and operated by the Kern River Gas Transmission Company.",
        "The Project began commercial operation in May 2016.",
      ],
      weather: currentWeather, // Use dynamic weather data
      generation: {
        generation: "58 MW",
        efficiency: "95%",
        uptime: "24/7",
      },
    },
    {
      description: [
        "The Horse Butte Wind Project is a 57.6 MW wind farm comprised of 32 Vestas V-100 1.8 MW wind turbines and related facilities and equipment.",
        "The facility is located approximately 16 miles east of the City of Idaho Falls and commenced commercial operation in August 2012.",
        "The project provides UAMPS members with a long-term supply of renewable electric energy and associated environmental attributes.",
      ],
      weather: currentWeather, // Use dynamic weather data
      generation: {
        generation: "62.5 MW",
        efficiency: "98.5%",
        uptime: "24/7",
      },
    },
  ];

  return (
    <div className="relative bg-white flex flex-col min-h-screen">
      {/* Background with CSS and transition */}
      <div
        className="absolute inset-0 opacity-60 transition-all duration-500 fade-in-out"
        style={{
          backgroundImage: `url(${backgroundImages[current]})`,
          backgroundSize: "cover", // fit inside without cropping
          backgroundColor: "white", // or any fallback color behind gaps
        }}
      />

      <div className="mx-[8vh] my-[6vh] 4k:mx-[8vh] 4k:my-[8vh] z-10">
        {/* Header - Scalable */}
        <header>
          <div className="font-sans text-lg text-right tv:text-3xl 4k:text-6xl ">
            Monday, August 11, 2025
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
          plugins={[Autoplay({ delay: 12000, stopOnInteraction: true })]}
          className="w-full"
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-[70vh] 4k:h-[80vh]">
                <CarouselSlideContent slide={slide} />
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
