import { Route } from "@/types";

/**
 * Real Kanpur e-bus routes based on KCTSL / knocksense / TellMyRoute data.
 *
 * Coordinates are best-effort approximations placed on known Kanpur road
 * corridors. Waypoints include intermediate points between stops so that
 * polylines visually trace the road network rather than fly in straight lines.
 *
 * Sources:
 *   - knocksense.com/kanpur/kanpur-25-e-buses-begin-today
 *   - en.wikipedia.org/wiki/Kanpur_City_Transport_Services_Limited
 *   - tellmyroute.com routes KE-1, KE-4
 */

export const MOCK_ROUTES: Route[] = [
  // ────────────────────────────────────────────────────────────
  // KE-1  Sanjeev Nagar → IIT Kanpur  (≈23 km)
  // ────────────────────────────────────────────────────────────
  {
    id: "R-01",
    code: "KE-1",
    name: "Sanjeev Nagar → IIT Kanpur",
    color: "#49D9FF",
    speedLimitKmh: 50,
    deviationCorridorMeters: 150,
    deviationPersistenceSec: 30,
    unplannedStopThresholdMin: 3,
    stops: [
      { id: "S1-01", sequence: 1,  name: "Sanjeev Nagar",       lat: 26.4165, lng: 80.4005, expectedDwellSec: 90 },
      { id: "S1-02", sequence: 2,  name: "Ramadevi",            lat: 26.4345, lng: 80.3850, expectedDwellSec: 45 },
      { id: "S1-03", sequence: 3,  name: "Kashiram Hospital",   lat: 26.4420, lng: 80.3730, expectedDwellSec: 45 },
      { id: "S1-04", sequence: 4,  name: "Krishna Nagar",       lat: 26.4480, lng: 80.3625, expectedDwellSec: 45 },
      { id: "S1-05", sequence: 5,  name: "Parachute Mod",       lat: 26.4520, lng: 80.3530, expectedDwellSec: 30 },
      { id: "S1-06", sequence: 6,  name: "Tatmil",              lat: 26.4550, lng: 80.3430, expectedDwellSec: 45 },
      { id: "S1-07", sequence: 7,  name: "Opium Kothi",         lat: 26.4575, lng: 80.3350, expectedDwellSec: 30 },
      { id: "S1-08", sequence: 8,  name: "Zarib Chowki",        lat: 26.4570, lng: 80.3270, expectedDwellSec: 30 },
      { id: "S1-09", sequence: 9,  name: "Kokakola Chauraha",   lat: 26.4625, lng: 80.3170, expectedDwellSec: 30 },
      { id: "S1-10", sequence: 10, name: "Rawatpur",            lat: 26.4810, lng: 80.3030, expectedDwellSec: 45 },
      { id: "S1-11", sequence: 11, name: "Gurudev Chauraha",    lat: 26.4945, lng: 80.2805, expectedDwellSec: 45 },
      { id: "S1-12", sequence: 12, name: "Vishwavidyalaya",     lat: 26.4985, lng: 80.2645, expectedDwellSec: 45 },
      { id: "S1-13", sequence: 13, name: "Kalyanpur",           lat: 26.5050, lng: 80.2410, expectedDwellSec: 60 },
      { id: "S1-14", sequence: 14, name: "IIT Kanpur",          lat: 26.5130, lng: 80.2320, expectedDwellSec: 90 },
    ],
    waypoints: [
      // Sanjeev Nagar (Chakeri side, east Kanpur)
      [26.4165, 80.4005],
      [26.4210, 80.3960],
      [26.4255, 80.3920],
      // Ramadevi
      [26.4345, 80.3850],
      [26.4380, 80.3795],
      // Kashiram Hospital
      [26.4420, 80.3730],
      [26.4450, 80.3680],
      // Krishna Nagar
      [26.4480, 80.3625],
      // Parachute Mod
      [26.4520, 80.3530],
      // Tatmil (GT Road corridor)
      [26.4550, 80.3430],
      // Opium Kothi
      [26.4575, 80.3350],
      // Zarib Chowki
      [26.4570, 80.3270],
      // Kokakola Chauraha
      [26.4625, 80.3170],
      [26.4680, 80.3110],
      // Rawatpur
      [26.4810, 80.3030],
      [26.4870, 80.2920],
      // Gurudev Chauraha
      [26.4945, 80.2805],
      [26.4970, 80.2720],
      // Vishwavidyalaya (CSJM University)
      [26.4985, 80.2645],
      [26.5010, 80.2555],
      [26.5035, 80.2485],
      // Kalyanpur
      [26.5050, 80.2410],
      [26.5085, 80.2370],
      // IIT Kanpur Main Gate
      [26.5130, 80.2320],
    ],
  },

  // ────────────────────────────────────────────────────────────
  // KE-4  Sanjeev Nagar → Bithoor  (via Jajmau, Bada Chauraha, Kalyanpur)
  // ────────────────────────────────────────────────────────────
  {
    id: "R-02",
    code: "KE-4",
    name: "Sanjeev Nagar → Bithoor",
    color: "#4B7BFF",
    speedLimitKmh: 50,
    deviationCorridorMeters: 180,
    deviationPersistenceSec: 30,
    unplannedStopThresholdMin: 3,
    stops: [
      { id: "S2-01", sequence: 1,  name: "Sanjeev Nagar",      lat: 26.4165, lng: 80.4005, expectedDwellSec: 90 },
      { id: "S2-02", sequence: 2,  name: "Ramadevi",           lat: 26.4345, lng: 80.3850, expectedDwellSec: 45 },
      { id: "S2-03", sequence: 3,  name: "Harjender Nagar",    lat: 26.4440, lng: 80.3940, expectedDwellSec: 30 },
      { id: "S2-04", sequence: 4,  name: "Jajmau",             lat: 26.4530, lng: 80.4060, expectedDwellSec: 45 },
      { id: "S2-05", sequence: 5,  name: "Circuit House",      lat: 26.4615, lng: 80.3745, expectedDwellSec: 30 },
      { id: "S2-06", sequence: 6,  name: "Heer Palace",        lat: 26.4630, lng: 80.3630, expectedDwellSec: 30 },
      { id: "S2-07", sequence: 7,  name: "Phulbagh",           lat: 26.4555, lng: 80.3480, expectedDwellSec: 45 },
      { id: "S2-08", sequence: 8,  name: "Bada Chauraha",      lat: 26.4580, lng: 80.3325, expectedDwellSec: 60 },
      { id: "S2-09", sequence: 9,  name: "Chunniganj",         lat: 26.4620, lng: 80.3220, expectedDwellSec: 30 },
      { id: "S2-10", sequence: 10, name: "Motijheel",          lat: 26.4655, lng: 80.3208, expectedDwellSec: 45 },
      { id: "S2-11", sequence: 11, name: "Rawatpur",           lat: 26.4810, lng: 80.3030, expectedDwellSec: 45 },
      { id: "S2-12", sequence: 12, name: "Gurudev Chauraha",   lat: 26.4945, lng: 80.2805, expectedDwellSec: 30 },
      { id: "S2-13", sequence: 13, name: "Vishwavidyalaya",    lat: 26.4985, lng: 80.2645, expectedDwellSec: 30 },
      { id: "S2-14", sequence: 14, name: "Kalyanpur",          lat: 26.5050, lng: 80.2410, expectedDwellSec: 45 },
      { id: "S2-15", sequence: 15, name: "Singhpur",           lat: 26.5175, lng: 80.2210, expectedDwellSec: 30 },
      { id: "S2-16", sequence: 16, name: "Ishwariganj",        lat: 26.5280, lng: 80.2100, expectedDwellSec: 30 },
      { id: "S2-17", sequence: 17, name: "Bithoor",            lat: 26.6070, lng: 80.2740, expectedDwellSec: 90 },
    ],
    waypoints: [
      // Sanjeev Nagar
      [26.4165, 80.4005],
      [26.4250, 80.3930],
      // Ramadevi
      [26.4345, 80.3850],
      // Harjender Nagar (towards Jajmau, south-east)
      [26.4400, 80.3890],
      [26.4440, 80.3940],
      // Jajmau (leather belt, east of Ganga)
      [26.4490, 80.4000],
      [26.4530, 80.4060],
      // Circuit House (swing west via Grand Trunk Road corridor)
      [26.4540, 80.3920],
      [26.4580, 80.3830],
      [26.4615, 80.3745],
      // Heer Palace
      [26.4630, 80.3630],
      // Phulbagh
      [26.4590, 80.3550],
      [26.4555, 80.3480],
      // Bada Chauraha
      [26.4580, 80.3325],
      // Chunniganj
      [26.4620, 80.3220],
      // Motijheel
      [26.4655, 80.3208],
      // Rawatpur
      [26.4730, 80.3115],
      [26.4810, 80.3030],
      // Gurudev
      [26.4870, 80.2920],
      [26.4945, 80.2805],
      // Vishwavidyalaya
      [26.4985, 80.2645],
      // Kalyanpur
      [26.5050, 80.2410],
      // Singhpur (north-west of Kalyanpur)
      [26.5110, 80.2310],
      [26.5175, 80.2210],
      // Ishwariganj
      [26.5280, 80.2100],
      // Road towards Bithoor (follows GT Road / Bithoor Road along Ganga)
      [26.5400, 80.2100],
      [26.5540, 80.2250],
      [26.5700, 80.2400],
      [26.5870, 80.2580],
      // Bithoor (holy town on Ganga)
      [26.6070, 80.2740],
    ],
  },

  // ────────────────────────────────────────────────────────────
  // Route 7  Barra → Jarauli  (via Govind Nagar, Tatmil, Kanpur Central)
  // ────────────────────────────────────────────────────────────
  {
    id: "R-03",
    code: "RT-7",
    name: "Barra → Jarauli",
    color: "#38D996",
    speedLimitKmh: 45,
    deviationCorridorMeters: 120,
    deviationPersistenceSec: 25,
    unplannedStopThresholdMin: 3,
    stops: [
      { id: "S3-01", sequence: 1, name: "Barra",                lat: 26.4225, lng: 80.2830, expectedDwellSec: 90 },
      { id: "S3-02", sequence: 2, name: "Barra Bypass",         lat: 26.4190, lng: 80.2920, expectedDwellSec: 30 },
      { id: "S3-03", sequence: 3, name: "Sachan Guest House",   lat: 26.4210, lng: 80.3005, expectedDwellSec: 30 },
      { id: "S3-04", sequence: 4, name: "Nandlal",              lat: 26.4265, lng: 80.3055, expectedDwellSec: 30 },
      { id: "S3-05", sequence: 5, name: "Govind Nagar",         lat: 26.4325, lng: 80.2915, expectedDwellSec: 45 },
      { id: "S3-06", sequence: 6, name: "Baradevi",             lat: 26.4380, lng: 80.3060, expectedDwellSec: 30 },
      { id: "S3-07", sequence: 7, name: "Chalis Dukan",         lat: 26.4450, lng: 80.3220, expectedDwellSec: 45 },
      { id: "S3-08", sequence: 8, name: "Tatmil",               lat: 26.4550, lng: 80.3430, expectedDwellSec: 45 },
      { id: "S3-09", sequence: 9, name: "Kanpur Central",       lat: 26.4499, lng: 80.3500, expectedDwellSec: 60 },
    ],
    waypoints: [
      // Barra (south-west Kanpur)
      [26.4225, 80.2830],
      [26.4205, 80.2880],
      // Barra Bypass
      [26.4190, 80.2920],
      // Sachan Guest House
      [26.4200, 80.2970],
      [26.4210, 80.3005],
      // Nandlal
      [26.4240, 80.3035],
      [26.4265, 80.3055],
      // Govind Nagar (cuts north)
      [26.4290, 80.3010],
      [26.4325, 80.2915],
      // Baradevi (east towards Chalis Dukan)
      [26.4345, 80.2980],
      [26.4380, 80.3060],
      // Chalis Dukan
      [26.4420, 80.3145],
      [26.4450, 80.3220],
      // Tatmil (GT Road crossing)
      [26.4490, 80.3310],
      [26.4550, 80.3430],
      // Kanpur Central Station
      [26.4530, 80.3465],
      [26.4499, 80.3500],
    ],
  },

  // ────────────────────────────────────────────────────────────
  // Airport AC  IIT Gate → Kanpur Airport  (west to east)
  // ────────────────────────────────────────────────────────────
  {
    id: "R-04",
    code: "AC-AP",
    name: "IIT Gate → Kanpur Airport",
    color: "#FFB547",
    speedLimitKmh: 55,
    deviationCorridorMeters: 200,
    deviationPersistenceSec: 30,
    unplannedStopThresholdMin: 4,
    stops: [
      { id: "S4-01", sequence: 1,  name: "IIT Gate",               lat: 26.5130, lng: 80.2320, expectedDwellSec: 60 },
      { id: "S4-02", sequence: 2,  name: "Kalyanpur Rly Station",  lat: 26.5050, lng: 80.2410, expectedDwellSec: 45 },
      { id: "S4-03", sequence: 3,  name: "University Gate",        lat: 26.4985, lng: 80.2645, expectedDwellSec: 45 },
      { id: "S4-04", sequence: 4,  name: "Gurudev Crossing",       lat: 26.4945, lng: 80.2805, expectedDwellSec: 30 },
      { id: "S4-05", sequence: 5,  name: "Vikas Nagar Depot",      lat: 26.4915, lng: 80.2870, expectedDwellSec: 30 },
      { id: "S4-06", sequence: 6,  name: "KDA Signature",          lat: 26.4870, lng: 80.2940, expectedDwellSec: 30 },
      { id: "S4-07", sequence: 7,  name: "Allen Forest Zoo",       lat: 26.4805, lng: 80.3020, expectedDwellSec: 45 },
      { id: "S4-08", sequence: 8,  name: "Dr. Tilak Crossing",     lat: 26.4760, lng: 80.3100, expectedDwellSec: 30 },
      { id: "S4-09", sequence: 9,  name: "Company Bagh",           lat: 26.4700, lng: 80.3160, expectedDwellSec: 30 },
      { id: "S4-10", sequence: 10, name: "Emerald Garden",         lat: 26.4660, lng: 80.3220, expectedDwellSec: 30 },
      { id: "S4-11", sequence: 11, name: "Gastro Liver Hospital",  lat: 26.4640, lng: 80.3310, expectedDwellSec: 30 },
      { id: "S4-12", sequence: 12, name: "Hallet Crossing",        lat: 26.4615, lng: 80.3390, expectedDwellSec: 30 },
      { id: "S4-13", sequence: 13, name: "GSVM Medical College",   lat: 26.4595, lng: 80.3450, expectedDwellSec: 45 },
      { id: "S4-14", sequence: 14, name: "Model Town",             lat: 26.4560, lng: 80.3520, expectedDwellSec: 30 },
      { id: "S4-15", sequence: 15, name: "Mariampur Hospital",     lat: 26.4530, lng: 80.3590, expectedDwellSec: 30 },
      { id: "S4-16", sequence: 16, name: "Chawla Crossing",        lat: 26.4490, lng: 80.3650, expectedDwellSec: 30 },
      { id: "S4-17", sequence: 17, name: "Nirala Nagar",           lat: 26.4430, lng: 80.3720, expectedDwellSec: 30 },
      { id: "S4-18", sequence: 18, name: "Gaushala Road Crossing", lat: 26.4370, lng: 80.3780, expectedDwellSec: 30 },
      { id: "S4-19", sequence: 19, name: "Naubasta Crossing",      lat: 26.4300, lng: 80.3840, expectedDwellSec: 30 },
      { id: "S4-20", sequence: 20, name: "Kanpur Airport",         lat: 26.4040, lng: 80.3630, expectedDwellSec: 90 },
    ],
    waypoints: [
      // IIT Gate
      [26.5130, 80.2320],
      [26.5085, 80.2370],
      // Kalyanpur Rly Station
      [26.5050, 80.2410],
      [26.5020, 80.2520],
      // University Gate (CSJM)
      [26.4985, 80.2645],
      [26.4965, 80.2730],
      // Gurudev Crossing
      [26.4945, 80.2805],
      // Vikas Nagar Depot
      [26.4915, 80.2870],
      // KDA Signature
      [26.4870, 80.2940],
      // Allen Forest Zoo
      [26.4805, 80.3020],
      // Dr. Tilak Crossing
      [26.4760, 80.3100],
      // Company Bagh
      [26.4700, 80.3160],
      // Emerald Garden
      [26.4660, 80.3220],
      // Gastro Liver Hospital
      [26.4640, 80.3310],
      // Hallet Crossing
      [26.4615, 80.3390],
      // GSVM Medical College
      [26.4595, 80.3450],
      // Model Town
      [26.4560, 80.3520],
      // Mariampur Hospital
      [26.4530, 80.3590],
      // Chawla Crossing
      [26.4490, 80.3650],
      // Nirala Nagar
      [26.4430, 80.3720],
      // Gaushala Road Crossing
      [26.4370, 80.3780],
      // Naubasta Crossing
      [26.4300, 80.3840],
      // Bypass flyover towards airport (swings south)
      [26.4230, 80.3810],
      [26.4155, 80.3740],
      [26.4090, 80.3680],
      // Kanpur Airport (Chakeri)
      [26.4040, 80.3630],
    ],
  },

  // ────────────────────────────────────────────────────────────
  // Route 1  Sarai Mita → Bada Chauraha  (via Barra Bypass, Kidwai Nagar, Tatmil)
  // ────────────────────────────────────────────────────────────
  {
    id: "R-05",
    code: "RT-1",
    name: "Sarai Mita → Bada Chauraha",
    color: "#E05BFF",
    speedLimitKmh: 45,
    deviationCorridorMeters: 150,
    deviationPersistenceSec: 30,
    unplannedStopThresholdMin: 3,
    stops: [
      { id: "S5-01", sequence: 1, name: "Sarai Mita",        lat: 26.4070, lng: 80.2560, expectedDwellSec: 60 },
      { id: "S5-02", sequence: 2, name: "Barra Bypass",      lat: 26.4225, lng: 80.2830, expectedDwellSec: 45 },
      { id: "S5-03", sequence: 3, name: "Yashoda Nagar",     lat: 26.4100, lng: 80.3125, expectedDwellSec: 45 },
      { id: "S5-04", sequence: 4, name: "Kidwai Nagar",      lat: 26.4140, lng: 80.3260, expectedDwellSec: 45 },
      { id: "S5-05", sequence: 5, name: "Chalis Dukan",      lat: 26.4450, lng: 80.3220, expectedDwellSec: 30 },
      { id: "S5-06", sequence: 6, name: "Tatmil",            lat: 26.4550, lng: 80.3430, expectedDwellSec: 45 },
      { id: "S5-07", sequence: 7, name: "Kanpur Central",    lat: 26.4499, lng: 80.3500, expectedDwellSec: 45 },
      { id: "S5-08", sequence: 8, name: "Bada Chauraha",     lat: 26.4580, lng: 80.3325, expectedDwellSec: 60 },
    ],
    waypoints: [
      // Sarai Mita (south of Barra)
      [26.4070, 80.2560],
      [26.4100, 80.2640],
      [26.4140, 80.2720],
      // Barra Bypass
      [26.4225, 80.2830],
      // Yashoda Nagar (south-east from Barra)
      [26.4180, 80.2960],
      [26.4130, 80.3050],
      [26.4100, 80.3125],
      // Kidwai Nagar
      [26.4120, 80.3195],
      [26.4140, 80.3260],
      // Chalis Dukan (north along Sarvodaya Nagar road)
      [26.4230, 80.3250],
      [26.4340, 80.3240],
      [26.4450, 80.3220],
      // Tatmil
      [26.4490, 80.3310],
      [26.4550, 80.3430],
      // Kanpur Central
      [26.4530, 80.3465],
      [26.4499, 80.3500],
      // Loop back to Bada Chauraha (Parade Ground)
      [26.4530, 80.3420],
      [26.4580, 80.3325],
    ],
  },

  // ────────────────────────────────────────────────────────────
  // Route 2  Chakeri Mod → Mandhana  (via Anwarganj, IIT)
  // ────────────────────────────────────────────────────────────
  {
    id: "R-06",
    code: "RT-2",
    name: "Chakeri Mod → Mandhana",
    color: "#FF6B6B",
    speedLimitKmh: 50,
    deviationCorridorMeters: 180,
    deviationPersistenceSec: 30,
    unplannedStopThresholdMin: 4,
    stops: [
      { id: "S6-01", sequence: 1,  name: "Chakeri Mod",        lat: 26.4210, lng: 80.3960, expectedDwellSec: 60 },
      { id: "S6-02", sequence: 2,  name: "Ramadevi",           lat: 26.4345, lng: 80.3850, expectedDwellSec: 45 },
      { id: "S6-03", sequence: 3,  name: "Shyam Nagar",        lat: 26.4405, lng: 80.3760, expectedDwellSec: 30 },
      { id: "S6-04", sequence: 4,  name: "Krishna Nagar",      lat: 26.4480, lng: 80.3625, expectedDwellSec: 30 },
      { id: "S6-05", sequence: 5,  name: "Chandari",           lat: 26.4510, lng: 80.3520, expectedDwellSec: 30 },
      { id: "S6-06", sequence: 6,  name: "Anwarganj",          lat: 26.4540, lng: 80.3380, expectedDwellSec: 45 },
      { id: "S6-07", sequence: 7,  name: "Rawatpur",           lat: 26.4810, lng: 80.3030, expectedDwellSec: 45 },
      { id: "S6-08", sequence: 8,  name: "Kalyanpur",          lat: 26.5050, lng: 80.2410, expectedDwellSec: 45 },
      { id: "S6-09", sequence: 9,  name: "IIT Kanpur",         lat: 26.5130, lng: 80.2320, expectedDwellSec: 45 },
      { id: "S6-10", sequence: 10, name: "Naramau",            lat: 26.5230, lng: 80.2180, expectedDwellSec: 30 },
      { id: "S6-11", sequence: 11, name: "Mandhana",           lat: 26.5380, lng: 80.2040, expectedDwellSec: 90 },
    ],
    waypoints: [
      // Chakeri Mod
      [26.4210, 80.3960],
      [26.4275, 80.3910],
      // Ramadevi
      [26.4345, 80.3850],
      // Shyam Nagar
      [26.4405, 80.3760],
      // Krishna Nagar
      [26.4480, 80.3625],
      // Chandari
      [26.4510, 80.3520],
      // Anwarganj
      [26.4540, 80.3380],
      // Rawatpur (via west corridor)
      [26.4590, 80.3270],
      [26.4680, 80.3110],
      [26.4810, 80.3030],
      // Gurudev → Kalyanpur (GT Road west)
      [26.4945, 80.2805],
      [26.4985, 80.2645],
      [26.5050, 80.2410],
      // IIT Kanpur
      [26.5085, 80.2370],
      [26.5130, 80.2320],
      // Naramau (north-west of IIT along NH-34)
      [26.5180, 80.2250],
      [26.5230, 80.2180],
      // Mandhana (far north-west)
      [26.5310, 80.2110],
      [26.5380, 80.2040],
    ],
  },
];
