"use client";

import { Tabs } from "../components/ui/tabs";
import { WeatherDashboard } from "../components/ui/weatherDash";

export default function TabsDemo() {
  const tabs = [
    {
      title: "Red Mesa Solar",
      value: "red-mesa-solar",
      content: <WeatherDashboard />,
    },
    {
      title: "Some Other Dashboard",
      value: "some-other-dashboard",
      content: (
        <div className="bg-blue-500">
          <p className=" mb-4 ">Some Other Dashboard</p>
          <DummyContent />
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <Tabs
        tabs={tabs}
        tabClassName="hidden"
        contentClassName="mt-0 h-full"
        autoSwitch={false}
        switchInterval={60000}
      />
    </div>
  );
}

const DummyContent = () => {
  return (
    <img
      src="/linear.webp"
      alt="dummy image"
      className="object-cover object-center max-h-[60vh] max-w-[80vw] rounded-xl"
    />
  );
};
