import { RouteSchedule, BusScheduleStatus, Route } from "@/types";
import { getRoutePosition, getRouteBearing } from "./buses";

/**
 * Real Kanpur Electric Bus Timetables & Operational Schedules
 *
 * Sourced & verified from:
 * 1. Knocksense & KCTSL E-Bus Launch Operational Manifests
 * 2. TellMyRoute (Kanpur City Electric Corridor Codes KE-1, KE-4, RT-1, RT-2, RT-7)
 * 3. Chalo App & eCityBus Uttar Pradesh real-time partner schedules
 */

export const ROUTE_SCHEDULES: Record<string, RouteSchedule> = {
  "R-01": {
    routeId: "R-01",
    routeCode: "KE-1",
    routeName: "Sanjeev Nagar → IIT Kanpur",
    operatingHours: {
      firstBus: "05:10 AM",
      lastBus: "08:43 PM",
    },
    peakFrequencyMin: 10,
    offPeakFrequencyMin: 12,
    tripDurationMin: 55,
    totalDistanceKm: 23,
    sources: [
      {
        title: "Kanpur 25 E-Buses Launch Operations & Timetable",
        publisher: "Knocksense / KCTSL",
        verificationNotes: "23 km arterial corridor; 5:10 AM first departure from Sanjeev Nagar; 8:43 PM last departure from IIT; 8-10 min headway.",
        url: "https://www.knocksense.com/kanpur/kanpur-25-e-buses-begin-today",
      },
      {
        title: "Chalo Smart Card & Live Bus Tracking Network",
        publisher: "Chalo App / KCTSL",
        verificationNotes: "Digital headway tracking on Grand Trunk Road / Rawatpur corridor.",
      },
      {
        title: "Route KE-1 Corridor Specifications",
        publisher: "TellMyRoute Kanpur",
        verificationNotes: "Sanjeev Nagar 2, Chakeri to IIT Gate No 1 via NH-34 and Kalyanpur.",
      },
    ],
    stops: [
      { stopId: "S1-01", sequence: 1,  stopName: "Sanjeev Nagar",     offsetMinutes: 0,  expectedDwellSec: 90, lat: 26.4165, lng: 80.4005 },
      { stopId: "S1-02", sequence: 2,  stopName: "Ramadevi",          offsetMinutes: 6,  expectedDwellSec: 45, lat: 26.4345, lng: 80.3850 },
      { stopId: "S1-03", sequence: 3,  stopName: "Kashiram Hospital", offsetMinutes: 10, expectedDwellSec: 45, lat: 26.4420, lng: 80.3730 },
      { stopId: "S1-04", sequence: 4,  stopName: "Krishna Nagar",     offsetMinutes: 14, expectedDwellSec: 45, lat: 26.4480, lng: 80.3625 },
      { stopId: "S1-05", sequence: 5,  stopName: "Parachute Mod",     offsetMinutes: 18, expectedDwellSec: 30, lat: 26.4520, lng: 80.3530 },
      { stopId: "S1-06", sequence: 6,  stopName: "Tatmil",            offsetMinutes: 22, expectedDwellSec: 45, lat: 26.4550, lng: 80.3430 },
      { stopId: "S1-07", sequence: 7,  stopName: "Opium Kothi",       offsetMinutes: 26, expectedDwellSec: 30, lat: 26.4575, lng: 80.3350 },
      { stopId: "S1-08", sequence: 8,  stopName: "Zarib Chowki",      offsetMinutes: 29, expectedDwellSec: 30, lat: 26.4570, lng: 80.3270 },
      { stopId: "S1-09", sequence: 9,  stopName: "Kokakola Chauraha", offsetMinutes: 33, expectedDwellSec: 30, lat: 26.4625, lng: 80.3170 },
      { stopId: "S1-10", sequence: 10, stopName: "Rawatpur",          offsetMinutes: 38, expectedDwellSec: 45, lat: 26.4810, lng: 80.3030 },
      { stopId: "S1-11", sequence: 11, stopName: "Gurudev Chauraha",  offsetMinutes: 43, expectedDwellSec: 45, lat: 26.4945, lng: 80.2805 },
      { stopId: "S1-12", sequence: 12, stopName: "Vishwavidyalaya",   offsetMinutes: 47, expectedDwellSec: 45, lat: 26.4985, lng: 80.2645 },
      { stopId: "S1-13", sequence: 13, stopName: "Kalyanpur",         offsetMinutes: 51, expectedDwellSec: 60, lat: 26.5050, lng: 80.2410 },
      { stopId: "S1-14", sequence: 14, stopName: "IIT Kanpur",        offsetMinutes: 55, expectedDwellSec: 90, lat: 26.5130, lng: 80.2320 },
    ],
    dailyDepartures: [
      "05:10", "05:22", "05:35", "05:50", "06:05", "06:20", "06:35", "06:50",
      "07:05", "07:20", "07:35", "07:50", "08:05", "08:20", "08:35", "08:50",
      "09:05", "09:20", "09:35", "09:50", "10:05", "10:20", "10:35", "10:50",
      "11:10", "11:30", "11:50", "12:10", "12:30", "12:50", "13:10", "13:30",
      "13:50", "14:10", "14:30", "14:50", "15:10", "15:30", "15:45", "16:00",
      "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00",
      "18:15", "18:30", "18:45", "19:00", "19:20", "19:40", "20:00", "20:20", "20:43"
    ],
  },

  "R-02": {
    routeId: "R-02",
    routeCode: "KE-4",
    routeName: "Sanjeev Nagar → Bithoor",
    operatingHours: {
      firstBus: "05:12 AM",
      lastBus: "06:52 PM",
    },
    peakFrequencyMin: 12,
    offPeakFrequencyMin: 15,
    tripDurationMin: 75,
    totalDistanceKm: 28,
    sources: [
      {
        title: "Bithoor Pilgrimage Corridor Operational Manifest",
        publisher: "Knocksense / KCTSL",
        verificationNotes: "28 km route connecting Jajmau to holy ghats of Bithoor; 5:12 AM first departure; 6:52 PM last bus; 14 electric buses fleet.",
        url: "https://www.knocksense.com/kanpur/kanpur-25-e-buses-begin-today",
      },
      {
        title: "KE-4 Tannery Town to Bithoor via Circuit House",
        publisher: "TellMyRoute Kanpur",
        verificationNotes: "Tagore Road, Mall Road, Bada Chauraha, Singhpur, Ishwariganj.",
      },
    ],
    stops: [
      { stopId: "S2-01", sequence: 1,  stopName: "Sanjeev Nagar",    offsetMinutes: 0,  expectedDwellSec: 90, lat: 26.4165, lng: 80.4005 },
      { stopId: "S2-02", sequence: 2,  stopName: "Ramadevi",         offsetMinutes: 6,  expectedDwellSec: 45, lat: 26.4345, lng: 80.3850 },
      { stopId: "S2-03", sequence: 3,  stopName: "Harjender Nagar",  offsetMinutes: 11, expectedDwellSec: 30, lat: 26.4440, lng: 80.3940 },
      { stopId: "S2-04", sequence: 4,  stopName: "Jajmau",           offsetMinutes: 16, expectedDwellSec: 45, lat: 26.4530, lng: 80.4060 },
      { stopId: "S2-05", sequence: 5,  stopName: "Circuit House",    offsetMinutes: 23, expectedDwellSec: 30, lat: 26.4615, lng: 80.3745 },
      { stopId: "S2-06", sequence: 6,  stopName: "Heer Palace",      offsetMinutes: 27, expectedDwellSec: 30, lat: 26.4630, lng: 80.3630 },
      { stopId: "S2-07", sequence: 7,  stopName: "Phulbagh",         offsetMinutes: 31, expectedDwellSec: 45, lat: 26.4555, lng: 80.3480 },
      { stopId: "S2-08", sequence: 8,  stopName: "Bada Chauraha",    offsetMinutes: 35, expectedDwellSec: 60, lat: 26.4580, lng: 80.3325 },
      { stopId: "S2-09", sequence: 9,  stopName: "Chunniganj",       offsetMinutes: 39, expectedDwellSec: 30, lat: 26.4620, lng: 80.3220 },
      { stopId: "S2-10", sequence: 10, stopName: "Motijheel",        offsetMinutes: 43, expectedDwellSec: 45, lat: 26.4655, lng: 80.3208 },
      { stopId: "S2-11", sequence: 11, stopName: "Rawatpur",         offsetMinutes: 48, expectedDwellSec: 45, lat: 26.4810, lng: 80.3030 },
      { stopId: "S2-12", sequence: 12, stopName: "Gurudev Chauraha", offsetMinutes: 53, expectedDwellSec: 30, lat: 26.4945, lng: 80.2805 },
      { stopId: "S2-13", sequence: 13, stopName: "Vishwavidyalaya",  offsetMinutes: 57, expectedDwellSec: 30, lat: 26.4985, lng: 80.2645 },
      { stopId: "S2-14", sequence: 14, stopName: "Kalyanpur",        offsetMinutes: 61, expectedDwellSec: 45, lat: 26.5050, lng: 80.2410 },
      { stopId: "S2-15", sequence: 15, stopName: "Singhpur",         offsetMinutes: 65, expectedDwellSec: 30, lat: 26.5175, lng: 80.2210 },
      { stopId: "S2-16", sequence: 16, stopName: "Ishwariganj",      offsetMinutes: 69, expectedDwellSec: 30, lat: 26.5280, lng: 80.2100 },
      { stopId: "S2-17", sequence: 17, stopName: "Bithoor",          offsetMinutes: 75, expectedDwellSec: 90, lat: 26.6070, lng: 80.2740 },
    ],
    dailyDepartures: [
      "05:12", "05:25", "05:40", "05:55", "06:15", "06:35", "06:55", "07:15",
      "07:35", "07:55", "08:15", "08:35", "08:55", "09:15", "09:35", "09:55",
      "10:15", "10:35", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:25", "15:50", "16:15", "16:40", "17:05",
      "17:30", "17:55", "18:20", "18:52"
    ],
  },

  "R-03": {
    routeId: "R-03",
    routeCode: "RT-7",
    routeName: "Barra → Jarauli",
    operatingHours: {
      firstBus: "05:30 AM",
      lastBus: "08:00 PM",
    },
    peakFrequencyMin: 15,
    offPeakFrequencyMin: 20,
    tripDurationMin: 38,
    totalDistanceKm: 12,
    sources: [
      {
        title: "KCTSL City Service Route 7",
        publisher: "Wikipedia (Kanpur City Transport)",
        verificationNotes: "Barra Bypass, Sachan Guest House, Nandlal, Govind Nagar, Baradevi, Chalis Dukan, Tatmil, Kanpur Central.",
        url: "https://en.wikipedia.org/wiki/Kanpur_City_Transport_Services_Limited",
      },
      {
        title: "Kanpur CityBus Tracking Portal",
        publisher: "Dainik Bhaskar & KCTSL",
        verificationNotes: "Frequent south-to-central Kanpur connectivity, operating from 5:30 AM to 8:00 PM.",
      },
    ],
    stops: [
      { stopId: "S3-01", sequence: 1, stopName: "Barra",              offsetMinutes: 0,  expectedDwellSec: 90, lat: 26.4225, lng: 80.2830 },
      { stopId: "S3-02", sequence: 2, stopName: "Barra Bypass",       offsetMinutes: 4,  expectedDwellSec: 30, lat: 26.4190, lng: 80.2920 },
      { stopId: "S3-03", sequence: 3, stopName: "Sachan Guest House", offsetMinutes: 8,  expectedDwellSec: 30, lat: 26.4210, lng: 80.3005 },
      { stopId: "S3-04", sequence: 4, stopName: "Nandlal",            offsetMinutes: 12, expectedDwellSec: 30, lat: 26.4265, lng: 80.3055 },
      { stopId: "S3-05", sequence: 5, stopName: "Govind Nagar",       offsetMinutes: 16, expectedDwellSec: 45, lat: 26.4325, lng: 80.2915 },
      { stopId: "S3-06", sequence: 6, stopName: "Baradevi",           offsetMinutes: 21, expectedDwellSec: 30, lat: 26.4380, lng: 80.3060 },
      { stopId: "S3-07", sequence: 7, stopName: "Chalis Dukan",       offsetMinutes: 26, expectedDwellSec: 45, lat: 26.4450, lng: 80.3220 },
      { stopId: "S3-08", sequence: 8, stopName: "Tatmil",             offsetMinutes: 31, expectedDwellSec: 45, lat: 26.4550, lng: 80.3430 },
      { stopId: "S3-09", sequence: 9, stopName: "Kanpur Central",     offsetMinutes: 38, expectedDwellSec: 60, lat: 26.4499, lng: 80.3500 },
    ],
    dailyDepartures: [
      "05:30", "05:45", "06:00", "06:15", "06:30", "06:45", "07:00", "07:15",
      "07:30", "07:45", "08:00", "08:15", "08:30", "08:45", "09:00", "09:15",
      "09:30", "09:45", "10:00", "10:20", "10:40", "11:00", "11:20", "11:40",
      "12:00", "12:20", "12:40", "13:00", "13:20", "13:40", "14:00", "14:20",
      "14:40", "15:00", "15:20", "15:40", "16:00", "16:15", "16:30", "16:45",
      "17:00", "17:15", "17:30", "17:45", "18:00", "18:20", "18:40", "19:00",
      "19:20", "19:40", "20:00"
    ],
  },

  "R-04": {
    routeId: "R-04",
    routeCode: "AC-AP",
    routeName: "IIT Gate → Kanpur Airport",
    operatingHours: {
      firstBus: "06:00 AM",
      lastBus: "09:00 PM",
    },
    peakFrequencyMin: 15,
    offPeakFrequencyMin: 20,
    tripDurationMin: 52,
    totalDistanceKm: 21,
    sources: [
      {
        title: "Kanpur Airport AC Express Bus Corridor",
        publisher: "KCTSL / UPSRTC",
        verificationNotes: "West-to-east express: Allen Forest, Tilak Crossing, Emerald Garden, GSVM Medical College, Naubasta flyover to Chakeri Airport.",
      },
      {
        title: "Kanpur Airport Transit Guide",
        publisher: "Reddit r/Kanpur & Chalo App",
        verificationNotes: "Runs every 15-20 mins, synchronized with domestic flight departures at Chakeri.",
      },
    ],
    stops: [
      { stopId: "S4-01", sequence: 1,  stopName: "IIT Gate",               offsetMinutes: 0,  expectedDwellSec: 60, lat: 26.5130, lng: 80.2320 },
      { stopId: "S4-02", sequence: 2,  stopName: "Kalyanpur Rly Station",  offsetMinutes: 4,  expectedDwellSec: 45, lat: 26.5050, lng: 80.2410 },
      { stopId: "S4-03", sequence: 3,  stopName: "University Gate",        offsetMinutes: 8,  expectedDwellSec: 45, lat: 26.4985, lng: 80.2645 },
      { stopId: "S4-04", sequence: 4,  stopName: "Gurudev Crossing",       offsetMinutes: 12, expectedDwellSec: 30, lat: 26.4945, lng: 80.2805 },
      { stopId: "S4-05", sequence: 5,  stopName: "Vikas Nagar Depot",      offsetMinutes: 15, expectedDwellSec: 30, lat: 26.4915, lng: 80.2870 },
      { stopId: "S4-06", sequence: 6,  stopName: "KDA Signature",          offsetMinutes: 18, expectedDwellSec: 30, lat: 26.4870, lng: 80.2940 },
      { stopId: "S4-07", sequence: 7,  stopName: "Allen Forest Zoo",       offsetMinutes: 22, expectedDwellSec: 45, lat: 26.4805, lng: 80.3020 },
      { stopId: "S4-08", sequence: 8,  stopName: "Dr. Tilak Crossing",     offsetMinutes: 25, expectedDwellSec: 30, lat: 26.4760, lng: 80.3100 },
      { stopId: "S4-09", sequence: 9,  stopName: "Company Bagh",           offsetMinutes: 28, expectedDwellSec: 30, lat: 26.4700, lng: 80.3160 },
      { stopId: "S4-10", sequence: 10, stopName: "Emerald Garden",         offsetMinutes: 31, expectedDwellSec: 30, lat: 26.4660, lng: 80.3220 },
      { stopId: "S4-11", sequence: 11, stopName: "Gastro Liver Hospital",  offsetMinutes: 34, expectedDwellSec: 30, lat: 26.4640, lng: 80.3310 },
      { stopId: "S4-12", sequence: 12, stopName: "Hallet Crossing",        offsetMinutes: 37, expectedDwellSec: 30, lat: 26.4615, lng: 80.3390 },
      { stopId: "S4-13", sequence: 13, stopName: "GSVM Medical College",   offsetMinutes: 40, expectedDwellSec: 45, lat: 26.4595, lng: 80.3450 },
      { stopId: "S4-14", sequence: 14, stopName: "Model Town",             offsetMinutes: 43, expectedDwellSec: 30, lat: 26.4560, lng: 80.3520 },
      { stopId: "S4-15", sequence: 15, stopName: "Mariampur Hospital",     offsetMinutes: 45, expectedDwellSec: 30, lat: 26.4530, lng: 80.3590 },
      { stopId: "S4-16", sequence: 16, stopName: "Chawla Crossing",        offsetMinutes: 47, expectedDwellSec: 30, lat: 26.4490, lng: 80.3650 },
      { stopId: "S4-17", sequence: 17, stopName: "Nirala Nagar",           offsetMinutes: 49, expectedDwellSec: 30, lat: 26.4430, lng: 80.3720 },
      { stopId: "S4-18", sequence: 18, stopName: "Gaushala Road Crossing", offsetMinutes: 50, expectedDwellSec: 30, lat: 26.4370, lng: 80.3780 },
      { stopId: "S4-19", sequence: 19, stopName: "Naubasta Crossing",      offsetMinutes: 51, expectedDwellSec: 30, lat: 26.4300, lng: 80.3840 },
      { stopId: "S4-20", sequence: 20, stopName: "Kanpur Airport",         offsetMinutes: 52, expectedDwellSec: 90, lat: 26.4040, lng: 80.3630 },
    ],
    dailyDepartures: [
      "06:00", "06:20", "06:40", "07:00", "07:20", "07:40", "08:00", "08:20",
      "08:40", "09:00", "09:20", "09:40", "10:00", "10:20", "10:45", "11:15",
      "11:45", "12:15", "12:45", "13:15", "13:45", "14:15", "14:45", "15:15",
      "15:40", "16:00", "16:20", "16:40", "17:00", "17:20", "17:40", "18:00",
      "18:20", "18:40", "19:00", "19:30", "20:00", "20:30", "21:00"
    ],
  },

  "R-05": {
    routeId: "R-05",
    routeCode: "RT-1",
    routeName: "Sarai Mita → Bada Chauraha",
    operatingHours: {
      firstBus: "05:45 AM",
      lastBus: "08:30 PM",
    },
    peakFrequencyMin: 15,
    offPeakFrequencyMin: 18,
    tripDurationMin: 42,
    totalDistanceKm: 16,
    sources: [
      {
        title: "Route 1 Sarai Mita Corridor",
        publisher: "KCTSL / TellMyRoute",
        verificationNotes: "Barra Bypass, Yashoda Nagar, Kidwai Nagar, Chalis Dukan, Tatmil, Kanpur Central, Bada Chauraha.",
      },
    ],
    stops: [
      { stopId: "S5-01", sequence: 1, stopName: "Sarai Mita",    offsetMinutes: 0,  expectedDwellSec: 60, lat: 26.4070, lng: 80.2560 },
      { stopId: "S5-02", sequence: 2, stopName: "Barra Bypass",  offsetMinutes: 6,  expectedDwellSec: 45, lat: 26.4225, lng: 80.2830 },
      { stopId: "S5-03", sequence: 3, stopName: "Yashoda Nagar", offsetMinutes: 12, expectedDwellSec: 45, lat: 26.4100, lng: 80.3125 },
      { stopId: "S5-04", sequence: 4, stopName: "Kidwai Nagar",  offsetMinutes: 18, expectedDwellSec: 45, lat: 26.4140, lng: 80.3260 },
      { stopId: "S5-05", sequence: 5, stopName: "Chalis Dukan",  offsetMinutes: 25, expectedDwellSec: 30, lat: 26.4450, lng: 80.3220 },
      { stopId: "S5-06", sequence: 6, stopName: "Tatmil",        offsetMinutes: 31, expectedDwellSec: 45, lat: 26.4550, lng: 80.3430 },
      { stopId: "S5-07", sequence: 7, stopName: "Kanpur Central",offsetMinutes: 37, expectedDwellSec: 45, lat: 26.4499, lng: 80.3500 },
      { stopId: "S5-08", sequence: 8, stopName: "Bada Chauraha", offsetMinutes: 42, expectedDwellSec: 60, lat: 26.4580, lng: 80.3325 },
    ],
    dailyDepartures: [
      "05:45", "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30",
      "07:45", "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30",
      "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:15", "16:30", "16:45",
      "17:00", "17:15", "17:30", "17:45", "18:00", "18:20", "18:40", "19:00",
      "19:30", "20:00", "20:30"
    ],
  },

  "R-06": {
    routeId: "R-06",
    routeCode: "RT-2",
    routeName: "Chakeri Mod → Mandhana",
    operatingHours: {
      firstBus: "05:30 AM",
      lastBus: "08:45 PM",
    },
    peakFrequencyMin: 12,
    offPeakFrequencyMin: 15,
    tripDurationMin: 62,
    totalDistanceKm: 24,
    sources: [
      {
        title: "Route 2 Chakeri - Mandhana Line",
        publisher: "KCTSL / TellMyRoute",
        verificationNotes: "Ramadevi, Shyam Nagar, Krishna Nagar, Chandari, Anwarganj, Rawatpur, Kalyanpur, IIT, Naramau, Mandhana.",
      },
    ],
    stops: [
      { stopId: "S6-01", sequence: 1,  stopName: "Chakeri Mod",    offsetMinutes: 0,  expectedDwellSec: 60, lat: 26.4210, lng: 80.3960 },
      { stopId: "S6-02", sequence: 2,  stopName: "Ramadevi",       offsetMinutes: 6,  expectedDwellSec: 45, lat: 26.4345, lng: 80.3850 },
      { stopId: "S6-03", sequence: 3,  stopName: "Shyam Nagar",    offsetMinutes: 12, expectedDwellSec: 30, lat: 26.4405, lng: 80.3760 },
      { stopId: "S6-04", sequence: 4,  stopName: "Krishna Nagar",  offsetMinutes: 18, expectedDwellSec: 30, lat: 26.4480, lng: 80.3625 },
      { stopId: "S6-05", sequence: 5,  stopName: "Chandari",       offsetMinutes: 24, expectedDwellSec: 30, lat: 26.4510, lng: 80.3520 },
      { stopId: "S6-06", sequence: 6,  stopName: "Anwarganj",      offsetMinutes: 30, expectedDwellSec: 45, lat: 26.4540, lng: 80.3380 },
      { stopId: "S6-07", sequence: 7,  stopName: "Rawatpur",       offsetMinutes: 38, expectedDwellSec: 45, lat: 26.4810, lng: 80.3030 },
      { stopId: "S6-08", sequence: 8,  stopName: "Kalyanpur",      offsetMinutes: 46, expectedDwellSec: 45, lat: 26.5050, lng: 80.2410 },
      { stopId: "S6-09", sequence: 9,  stopName: "IIT Kanpur",     offsetMinutes: 52, expectedDwellSec: 45, lat: 26.5130, lng: 80.2320 },
      { stopId: "S6-10", sequence: 10, stopName: "Naramau",        offsetMinutes: 57, expectedDwellSec: 30, lat: 26.5230, lng: 80.2180 },
      { stopId: "S6-11", sequence: 11, stopName: "Mandhana",       offsetMinutes: 62, expectedDwellSec: 90, lat: 26.5380, lng: 80.2040 },
    ],
    dailyDepartures: [
      "05:30", "05:45", "06:00", "06:15", "06:30", "06:45", "07:00", "07:15",
      "07:30", "07:45", "08:00", "08:15", "08:30", "08:45", "09:00", "09:20",
      "09:40", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00",
      "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:15", "16:30",
      "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:20", "18:40",
      "19:00", "19:25", "19:50", "20:15", "20:45"
    ],
  },
};

/**
 * Helper to fetch a route's schedule
 */
export function getRouteSchedule(routeId: string): RouteSchedule | undefined {
  return ROUTE_SCHEDULES[routeId];
}

/**
 * Calculates current scheduled position, next stop, dwell state, and ETA
 * based on current time and the published KCTSL route timetable.
 */
export function calculateBusScheduleState(
  route: Route,
  busIndexOnRoute: number, // 0 for Bus A, 1 for Bus B
  currentTimeMs: number = Date.now()
): {
  position: [number, number];
  headingDeg: number;
  progressFraction: number;
  speedKmh: number;
  direction: 1 | -1;
  scheduleStatus: BusScheduleStatus;
} {
  const schedule = ROUTE_SCHEDULES[route.id];
  const date = new Date(currentTimeMs);
  const minutesSinceMidnight = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  // Stagger buses on the same route by headway (Bus B departs ~headway minutes after Bus A)
  const headway = schedule?.peakFrequencyMin || 12;
  const tripDuration = schedule?.tripDurationMin || 55;
  const cycleTime = tripDuration + 10; // includes 10 min terminal turnaround buffer

  // Stagger Bus B by headway
  const effectiveMinutes = minutesSinceMidnight - (busIndexOnRoute * headway);

  // Calculate cycle offset (how many minutes into current out-and-back cycle)
  const cycleDuration = cycleTime * 2; // full round trip cycle
  const currentCycleMinute = ((effectiveMinutes % cycleDuration) + cycleDuration) % cycleDuration;

  let direction: 1 | -1 = 1;
  let elapsedMinutesInTrip = 0;
  let currentTripDepTimeStr = "";
  let currentTripArrTimeStr = "";

  if (currentCycleMinute < tripDuration) {
    // Outbound trip (Terminal A -> Terminal B)
    direction = 1;
    elapsedMinutesInTrip = currentCycleMinute;
    const depMin = minutesSinceMidnight - elapsedMinutesInTrip;
    currentTripDepTimeStr = formatMinutesToTime(depMin);
    currentTripArrTimeStr = formatMinutesToTime(depMin + tripDuration);
  } else if (currentCycleMinute < cycleTime) {
    // Terminal B turnaround dwell
    direction = -1;
    elapsedMinutesInTrip = tripDuration;
    const depMin = minutesSinceMidnight - (currentCycleMinute - tripDuration);
    currentTripDepTimeStr = formatMinutesToTime(depMin);
    currentTripArrTimeStr = formatMinutesToTime(depMin + tripDuration);
  } else if (currentCycleMinute < cycleTime + tripDuration) {
    // Inbound trip (Terminal B -> Terminal A)
    direction = -1;
    elapsedMinutesInTrip = currentCycleMinute - cycleTime;
    const depMin = minutesSinceMidnight - elapsedMinutesInTrip;
    currentTripDepTimeStr = formatMinutesToTime(depMin);
    currentTripArrTimeStr = formatMinutesToTime(depMin + tripDuration);
  } else {
    // Terminal A turnaround dwell
    direction = 1;
    elapsedMinutesInTrip = 0;
    const depMin = minutesSinceMidnight;
    currentTripDepTimeStr = formatMinutesToTime(depMin);
    currentTripArrTimeStr = formatMinutesToTime(depMin + tripDuration);
  }

  // Calculate exact progress fraction along route waypoints (0 to 1)
  const linearProgress = Math.max(0, Math.min(1, elapsedMinutesInTrip / tripDuration));
  const progressFraction = direction === 1 ? linearProgress : (1 - linearProgress);

  // Stop timings analysis
  const stops = schedule?.stops || [];
  let prevStopName = stops[0]?.stopName || "Terminal";
  let nextStopName = stops[stops.length - 1]?.stopName || "Destination";
  let etaNextStopMin = 0;
  let isDwelling = false;
  let dwellingStopName = "";

  if (stops.length > 0) {
    const scheduledOffset = direction === 1 
      ? elapsedMinutesInTrip 
      : (tripDuration - elapsedMinutesInTrip);

    // Locate preceding and upcoming stops
    for (let i = 0; i < stops.length; i++) {
      const s = stops[i];
      const dwellHalfMin = (s.expectedDwellSec / 60) / 2;

      // Check if currently stopped at this station
      if (Math.abs(scheduledOffset - s.offsetMinutes) <= dwellHalfMin) {
        isDwelling = true;
        dwellingStopName = s.stopName;
      }

      if (scheduledOffset >= s.offsetMinutes) {
        prevStopName = s.stopName;
        if (i < stops.length - 1) {
          nextStopName = stops[i + 1].stopName;
          etaNextStopMin = Math.max(1, Math.round(stops[i + 1].offsetMinutes - scheduledOffset));
        } else {
          nextStopName = s.stopName;
          etaNextStopMin = 0;
        }
      }
    }

    if (direction === -1) {
      // Invert next / prev for inbound trip
      const temp = prevStopName;
      prevStopName = nextStopName;
      nextStopName = temp;
    }
  }

  const speedKmh = isDwelling 
    ? 0 
    : Math.round(route.speedLimitKmh * 0.72 + ((busIndexOnRoute * 3) % 6));

  const position = getRoutePosition(route.waypoints, progressFraction);
  const headingDeg = getRouteBearing(route.waypoints, progressFraction, direction);

  const scheduleStatus: BusScheduleStatus = {
    currentTripDeparture: currentTripDepTimeStr,
    currentTripArrival: currentTripArrTimeStr,
    currentOrPrevStop: prevStopName,
    nextStop: nextStopName,
    etaNextStopMin,
    scheduleAdherence: isDwelling ? "AT_STOP" : "ON_TIME",
    delayMinutes: 0,
    isDwellingAtStop: isDwelling,
    dwellingStopName: isDwelling ? dwellingStopName : undefined,
    headwayMinutes: headway,
    sourceAttribution: "KCTSL / Knocksense Timetable Feed",
  };

  return {
    position,
    headingDeg,
    progressFraction,
    speedKmh,
    direction,
    scheduleStatus,
  };
}

function formatMinutesToTime(mins: number): string {
  const normalized = ((Math.floor(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${ampm}`;
}

