"use client";

import { Tabs } from "../components/ui/tabs";
import { GenerationDashboard } from "../components/ui/weatherDash";
import { useState } from "react";

export default function TabsDemo() {
  const [activeTabValue, setActiveTabValue] = useState("generation-dashboard");

  const tabs = [
    {
      title: "Generation Dashboard",
      value: "generation-dashboard",
      content: (
        <GenerationDashboard
          isActive={activeTabValue === "generation-dashboard"}
        />
      ),
      duration: 30000, // 3 minutes (3 * 60 * 1000 ms)
    },
    {
      title: "UAMPS Values",
      value: "uamps-values",
      content: (
        <div className="bg-white fixed inset-0 w-screen h-screen p-8">
          <img
            src="Values Screensaver Desktop Wallpaper .webp"
            alt="Values"
            className="w-full h-full object-contain object-center"
          />
        </div>
      ),
      duration: 30000, // 1 minute (1 * 60 * 1000 ms)
    },
    {
      title: "UAMPS Video",
      value: "uamps-video",
      content: (
        <div className="bg-primary fixed inset-0 w-screen h-screen">
          <video
            src="/videos/About UAMPS Video.mp4"
            autoPlay
            muted
            loop
            className="w-full h-full object-contain object-center"
          />
        </div>
      ),
      duration: 30000, // 2 minutes 55 seconds (2*60*1000 + 55*1000 ms)
    },
  ];

  return (
    <div className="">
      <Tabs
        tabs={tabs}
        tabClassName="hidden"
        contentClassName="mt-0 h-full"
        autoSwitch={true}
        onActiveChange={(tab) => setActiveTabValue(tab.value)}
      />
    </div>
  );
}
