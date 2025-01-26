const CurrentLocation = {
  location: "Bacolod City",
  weather: "35°",
};

const ForecastData = {
  hourCast: [
    {
      id: "1",
      time: "Today",
      caution: "Caution",
      temp: "35C°",
      icon: "testicons.heat",
    },
    {
      id: "2",
      time: "10am",
      caution: "Extreme Caution",
      temp: "40C°",
      icon: "testicons.heat",
    },
    {
      id: "3",
      time: "11am",
      caution: "Normal",
      temp: "24C°",
      icon: "testicons.heat",
    },
    {
      id: "4",
      time: "12pm",
      caution: "Caution",
      temp: "35C°",
      icon: "testicons.heat",
    },
    {
      id: "5",
      time: "1pm",
      caution: "Caution",
      temp: "35C°",
      icon: "testicons.heat",
    },
  ],
  dayCast: [
    {
      id: "1",
      time: "Today",
      caution: "Caution",
      temp: "35°C",
      icon: "testicons.heatindex",
    },
    {
      id: "2",
      time: "Tomorrow",
      caution: "Extreme Caution",
      temp: "40°C",
      icon: "testicons.heatindex",
    },
    {
      id: "3",
      time: "Jan 24",
      caution: "Normal",
      temp: "24°C",
      icon: "testicons.heatindex",
    },
    {
      id: "4",
      time: "Jan 25",
      caution: "Caution",
      temp: "29°C",
      icon: "testicons.heatindex",
    },
    {
      id: "5",
      time: "Jan 25",
      caution: "Caution",
      temp: "31°C",
      icon: "testicons.heatindex",
    },
  ],
};

const AnalyticsData = [];

const NotificationData = [
  {
    date: "2024-01-20",
    notifications: [
      {
        id: "1",
        title: "Heat Index",
        temperature: "35°C",
        information: "Heat index is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature.",
      },
    ],
  },
  {
    date: "2024-01-21",
    notifications: [
      {
        id: "2",
        title: "Heat Index",
        temperature: "40°C",
        information: "Heat index is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature.",
      },
      {
        id: "3",
        title: "Heat Index",
        temperature: "24°C",
        information: "Heat index is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature.",
      },
    ],
  },
  {
    date: "2024-01-22",
    notifications: [
      {
        id: "4",
        title: "Heat Index",
        temperature: "29°C",
        information: "Heat index is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature.",
      },
    ],
  },
  {
    date: "2024-01-24",
    notifications: [
      {
        id: "5",
        title: "Heat Index",
        temperature: "31°C",
        information: "Heat index is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature.",
      },
    ],
  },
  {
    date: "2024-01-25",
    notifications: [
      {
        id: "6",
        title: "Heat Index",
        temperature: "35°C",
        information: "Heat index is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature.",
      },
      {
        id: "7",
        title: "Heat Index",
        temperature: "40°C",
        information: "Heat index is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature.",
      },
      {
        id: "8",
        title: "Heat Index",
        temperature: "24°C",
        information: "Heat index is a measure of how hot it really feels when relative humidity is factored in with the actual air temperature.",
      },
    ],
  },
];

export { CurrentLocation, ForecastData, AnalyticsData, NotificationData };
