'use client';

import { useState, useEffect } from 'react';
import { 
  Wind, Zap, TrendingUp, Database, Play, RefreshCw, 
  BarChart3, Target, LineChart, PieChart, Gauge, 
  MapPin, Calendar, Activity, AlertCircle, CheckCircle,
  ChevronRight, Download, Settings, Info
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Color palette
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Types
interface PlantInfo {
  name: string;
  location: string;
  capacity_mw: number;
  num_turbines: number;
  turbine_model: string;
  hub_height_m: number;
  rotor_diameter_m: number;
}

interface AnalysisResult {
  status: string;
  analysis_type: string;
  results: any;
  timestamp: string;
  message: string;
  execution_time_seconds?: number;
}

export default function Dashboard() {
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [dataOverview, setDataOverview] = useState<any>(null);
  const [scadaSummary, setScadaSummary] = useState<any>(null);
  const [powerCurve, setPowerCurve] = useState<any>(null);
  const [windRose, setWindRose] = useState<any>(null);
  const [reanalysis, setReanalysis] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState<string | null>(null);
  
  // Track initial data loading
  const [initialLoading, setInitialLoading] = useState({
    plantInfo: true,
    dataOverview: true,
    scadaSummary: true,
    powerCurve: true,
    windRose: true,
    reanalysis: true,
    availability: true,
  });

  // Fetch initial data
  useEffect(() => {
    fetchPlantInfo();
    fetchDataOverview();
    fetchScadaSummary();
    fetchPowerCurve();
    fetchWindRose();
    fetchReanalysis();
    fetchAvailability();
  }, []);

  const fetchPlantInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/info`);
      const data = await res.json();
      setPlantInfo(data.plant);
    } catch (err) {
      console.error('Failed to fetch plant info:', err);
    } finally {
      setInitialLoading(prev => ({ ...prev, plantInfo: false }));
    }
  };

  const fetchDataOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/data/overview`);
      const data = await res.json();
      setDataOverview(data);
    } catch (err) {
      console.error('Failed to fetch data overview:', err);
    } finally {
      setInitialLoading(prev => ({ ...prev, dataOverview: false }));
    }
  };

  const fetchScadaSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/data/scada/summary`);
      const data = await res.json();
      setScadaSummary(data);
    } catch (err) {
      console.error('Failed to fetch SCADA summary:', err);
    } finally {
      setInitialLoading(prev => ({ ...prev, scadaSummary: false }));
    }
  };

  const fetchPowerCurve = async (turbineId?: string) => {
    try {
      const url = turbineId 
        ? `${API_BASE}/api/data/power-curve?turbine_id=${turbineId}` 
        : `${API_BASE}/api/data/power-curve`;
      const res = await fetch(url);
      const data = await res.json();
      setPowerCurve(data);
    } catch (err) {
      console.error('Failed to fetch power curve:', err);
    } finally {
      setInitialLoading(prev => ({ ...prev, powerCurve: false }));
    }
  };

  const fetchWindRose = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/data/wind-rose`);
      const data = await res.json();
      setWindRose(data);
    } catch (err) {
      console.error('Failed to fetch wind rose:', err);
    } finally {
      setInitialLoading(prev => ({ ...prev, windRose: false }));
    }
  };

  const fetchReanalysis = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/data/reanalysis`);
      const data = await res.json();
      setReanalysis(data);
    } catch (err) {
      console.error('Failed to fetch reanalysis:', err);
    } finally {
      setInitialLoading(prev => ({ ...prev, reanalysis: false }));
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/data/availability`);
      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setInitialLoading(prev => ({ ...prev, availability: false }));
    }
  };

  const runAnalysis = async (analysisType: string) => {
    setLoading(prev => ({ ...prev, [analysisType]: true }));
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/run-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_type: analysisType,
          use_example_data: true,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed');
      }

      setAnalysisResults(prev => ({ ...prev, [analysisType]: data }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, [analysisType]: false }));
    }
  };

  // Analysis definitions
  const analyses = [
    {
      id: 'aep',
      name: 'Monte Carlo AEP',
      description: 'Annual Energy Production with uncertainty quantification',
      icon: TrendingUp,
      color: 'bg-blue-500',
      category: 'Energy Assessment'
    },
    {
      id: 'electrical_losses',
      name: 'Electrical Losses',
      description: 'Turbine to meter energy loss analysis',
      icon: Zap,
      color: 'bg-amber-500',
      category: 'Loss Analysis'
    },
    {
      id: 'wake_losses',
      name: 'Wake Losses',
      description: 'Internal wake effect estimation',
      icon: Wind,
      color: 'bg-green-500',
      category: 'Loss Analysis'
    },
    {
      id: 'turbine_gross_energy',
      name: 'Turbine Gross Energy',
      description: 'Long-term gross energy per turbine',
      icon: BarChart3,
      color: 'bg-purple-500',
      category: 'Energy Assessment'
    },
    {
      id: 'yaw_misalignment',
      name: 'Yaw Misalignment',
      description: 'Static yaw error detection',
      icon: Target,
      color: 'bg-rose-500',
      category: 'Performance'
    },
    {
      id: 'eya_gap',
      name: 'EYA Gap Analysis',
      description: 'Compare predictions vs operational results',
      icon: PieChart,
      color: 'bg-cyan-500',
      category: 'Assessment'
    },
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Gauge },
    { id: 'data', name: 'Data Explorer', icon: Database },
    { id: 'analyses', name: 'Analyses', icon: BarChart3 },
    { id: 'turbines', name: 'Turbine Performance', icon: Activity },
    { id: 'reports', name: 'Reports', icon: LineChart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/20">
                <Wind className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white">
                  <span className="hidden sm:inline">OpenOA Wind Farm Analytics</span>
                  <span className="sm:hidden">OpenOA Analytics</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm hidden xs:block">
                  <span className="hidden md:inline">{plantInfo?.name || 'La Haute Borne Wind Farm'} • </span>
                  <span className="hidden sm:inline">Operational Analysis</span>
                  <span className="sm:hidden">La Haute Borne</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs sm:text-sm font-medium">
                  <span className="hidden md:inline">API </span>Connected
                </span>
              </div>
              {/* Mobile status indicator */}
              <div className="sm:hidden w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Tabs - Scrollable on mobile */}
          <nav className="flex gap-1 mt-3 sm:mt-4 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">{tab.name}</span>
                <span className="xs:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm sm:text-base flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 p-1">×</button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-3 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <StatCard
                title="Capacity"
                value={`${plantInfo?.capacity_mw || 8.2} MW`}
                subtitle={`${plantInfo?.num_turbines || 4} × Senvion MM82`}
                icon={<Wind />}
                color="blue"
                isLoading={initialLoading.plantInfo}
              />
              <StatCard
                title="Total Energy"
                value={`${dataOverview?.scada?.total_energy_gwh || 0} GWh`}
                subtitle={`${dataOverview?.scada?.date_range?.years || 2} years`}
                icon={<Zap />}
                color="green"
                isLoading={initialLoading.dataOverview}
              />
              <StatCard
                title="SCADA Records"
                value={dataOverview?.scada?.rows?.toLocaleString() || '0'}
                subtitle="10-min resolution"
                icon={<Database />}
                color="purple"
                isLoading={initialLoading.dataOverview}
              />
              <StatCard
                title="Avg Wind"
                value={`${dataOverview?.scada?.avg_wind_speed_ms || 0} m/s`}
                subtitle={`CF: ${scadaSummary?.overall?.avg_capacity_factor_percent || 0}%`}
                icon={<Activity />}
                color="amber"
                isLoading={initialLoading.dataOverview || initialLoading.scadaSummary}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
              {/* Monthly Energy Chart */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-6">
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Monthly Energy Production
                </h3>
                {initialLoading.scadaSummary ? (
                  <ChartLoader height={200} />
                ) : scadaSummary?.monthly_data ? (
                  <ResponsiveContainer width="100%" height={200} className="sm:!h-[280px]">
                    <ComposedChart data={scadaSummary.monthly_data.slice(-24)} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 9 }} interval={2} />
                      <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 9 }} width={35} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF', fontSize: 9 }} width={30} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '11px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                      <Bar yAxisId="left" dataKey="energy_mwh" name="Energy (MWh)" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="avg_wind_speed_ms" name="Wind (m/s)" stroke="#10B981" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data available</div>
                )}
              </div>

              {/* Power Curve */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-6">
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4 flex items-center gap-2">
                  <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Power Curve
                </h3>
                {initialLoading.powerCurve ? (
                  <ChartLoader height={200} />
                ) : powerCurve?.measured_curve ? (
                  <ResponsiveContainer width="100%" height={200} className="sm:!h-[280px]">
                    <ComposedChart data={powerCurve.measured_curve} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="wind_speed" tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 9 }} width={35} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '11px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                      <Area type="monotone" dataKey="power_p95" stackId="1" fill="#3B82F620" stroke="none" name="P95" />
                      <Area type="monotone" dataKey="power_p5" stackId="2" fill="#1F2937" stroke="none" name="P5" />
                      <Line type="monotone" dataKey="power_mean" stroke="#10B981" strokeWidth={2} name="Mean" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data available</div>
                )}
              </div>
            </div>

            {/* Turbine Performance */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-6">
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                Turbine Performance
              </h3>
              {initialLoading.scadaSummary ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-700/30 rounded-lg p-2 sm:p-4 border border-slate-600/50 animate-pulse">
                      <div className="h-4 w-20 bg-slate-600/50 rounded mb-3" />
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-600/30 rounded" />
                        <div className="h-3 w-3/4 bg-slate-600/30 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {scadaSummary?.turbine_statistics?.map((turbine: any) => (
                  <div key={turbine.turbine_id} className="bg-slate-700/30 rounded-lg p-2 sm:p-4 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-3">
                      <span className="font-medium text-white text-[11px] sm:text-base truncate">{turbine.turbine_id}</span>
                      <span className={`px-1 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs font-medium ${
                        turbine.capacity_factor_percent > 25 ? 'bg-green-500/20 text-green-400' :
                        turbine.capacity_factor_percent > 20 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {turbine.capacity_factor_percent}%
                      </span>
                    </div>
                    <div className="space-y-0.5 sm:space-y-2 text-[10px] sm:text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>Annual</span>
                        <span className="text-white">{(turbine.annual_energy_mwh/1000).toFixed(1)}k</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Power</span>
                        <span className="text-white">{turbine.avg_power_kw} kW</span>
                      </div>
                      <div className="hidden sm:flex justify-between text-slate-400">
                        <span>Avg Wind</span>
                        <span className="text-white">{turbine.avg_wind_speed_ms} m/s</span>
                      </div>
                      <div className="hidden sm:flex justify-between text-slate-400">
                        <span>Availability</span>
                        <span className="text-white">{turbine.data_availability_percent}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Quick Analysis */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-6">
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                {analyses.slice(0, 3).map(analysis => (
                  <button
                    key={analysis.id}
                    onClick={() => { runAnalysis(analysis.id); setActiveTab('analyses'); }}
                    disabled={loading[analysis.id]}
                    className={`p-3 sm:p-4 rounded-xl border transition-all ${
                      analysisResults[analysis.id]
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-slate-700/30 border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${analysis.color}`}>
                        <analysis.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="font-medium text-white text-xs sm:text-base truncate">{analysis.name}</h4>
                        <p className="text-[10px] sm:text-xs text-slate-400 truncate">{analysis.description}</p>
                      </div>
                      {loading[analysis.id] ? (
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 animate-spin flex-shrink-0" />
                      ) : analysisResults[analysis.id] ? (
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Explorer Tab */}
        {activeTab === 'data' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Data Sources */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <DataSourceCard
                title="SCADA Data"
                records={dataOverview?.scada?.rows}
                period={`${dataOverview?.scada?.date_range?.start?.slice(0, 10) || ''} to ${dataOverview?.scada?.date_range?.end?.slice(0, 10) || ''}`}
                icon={<Database className="w-4 h-4 sm:w-5 sm:h-5" />}
                status="available"
                isLoading={initialLoading.dataOverview}
              />
              <DataSourceCard
                title="Plant Meter"
                records={dataOverview?.plant_meter?.rows}
                period={`${dataOverview?.plant_meter?.total_energy_gwh || 0} GWh`}
                icon={<Gauge className="w-4 h-4 sm:w-5 sm:h-5" />}
                status="available"
                isLoading={initialLoading.dataOverview}
              />
              <DataSourceCard
                title="ERA5"
                records={dataOverview?.reanalysis?.era5?.rows}
                period={dataOverview?.reanalysis?.era5?.period || ''}
                icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
                status="available"
                isLoading={initialLoading.dataOverview}
              />
              <DataSourceCard
                title="MERRA2"
                records={dataOverview?.reanalysis?.merra2?.rows}
                period={dataOverview?.reanalysis?.merra2?.period || ''}
                icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
                status="available"
                isLoading={initialLoading.dataOverview}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Wind Rose */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-6">
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  Wind Rose
                </h3>
                {initialLoading.windRose ? (
                  <ChartLoader height={280} />
                ) : windRose?.data ? (
                  <>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={windRose.data}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="direction_label" tick={{ fill: '#9CA3AF', fontSize: 8 }} />
                      <PolarRadiusAxis tick={{ fill: '#9CA3AF', fontSize: 8 }} />
                      <Radar
                        name="Frequency %"
                        dataKey="frequency_percent"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.5}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(value: any) => [`${value}%`, 'Frequency']}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-center text-xs sm:text-sm text-slate-400">
                    Predominant: <span className="text-white font-medium">{windRose.predominant_direction}°</span> ({windRose.predominant_frequency}%)
                  </div>
                  </>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">No data available</div>
                )}
              </div>

              {/* Reanalysis Comparison */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-6">
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  Long-Term Wind (ERA5)
                </h3>
                {initialLoading.reanalysis ? (
                  <ChartLoader height={280} />
                ) : reanalysis?.era5?.annual_data ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={reanalysis.era5.annual_data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 10 }} domain={['auto', 'auto']} width={35} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF', fontSize: 10 }} width={35} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar yAxisId="left" dataKey="avg_wind_speed_ms" name="Wind (m/s)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="anomaly_percent" name="Anomaly (%)" stroke="#F59E0B" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">No data available</div>
                )}
                {reanalysis?.era5 && !initialLoading.reanalysis && (
                  <div className="mt-3 text-center text-xs sm:text-sm text-slate-400">
                    LT Mean: <span className="text-white font-medium">{reanalysis.era5.long_term_mean_ws_ms} m/s</span> ({reanalysis.era5.total_years} yrs)
                  </div>
                )}
              </div>
            </div>

            {/* Availability & Curtailment */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-6">
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                Availability & Curtailment
              </h3>
              {initialLoading.availability ? (
                <ChartLoader height={250} />
              ) : availability?.monthly_data ? (
                <>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={availability.monthly_data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 10 }} width={35} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF', fontSize: 10 }} domain={[90, 100]} width={35} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar yAxisId="left" dataKey="net_energy_mwh" name="Energy (MWh)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="availability_loss_mwh" name="Loss (MWh)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="availability_percent" name="Avail (%)" stroke="#10B981" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              {availability?.overall && (
                <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="p-2 sm:p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-white">{availability.overall.total_net_energy_gwh}</div>
                    <div className="text-[10px] sm:text-sm text-slate-400">GWh Net</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-green-400">{availability.overall.overall_availability_percent}%</div>
                    <div className="text-[10px] sm:text-sm text-slate-400">Availability</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-amber-400">{availability.overall.overall_curtailment_percent}%</div>
                    <div className="text-[10px] sm:text-sm text-slate-400">Curtailment</div>
                  </div>
                </div>
              )}
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">No data available</div>
              )}
            </div>
          </div>
        )}

        {/* Analyses Tab */}
        {activeTab === 'analyses' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Analysis Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {analyses.map(analysis => (
                <div key={analysis.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
                  <div className="p-2.5 sm:p-4 border-b border-slate-700">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${analysis.color}`}>
                        <analysis.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white text-xs sm:text-base truncate">{analysis.name}</h4>
                        <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">{analysis.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-4">
                    <p className="text-[11px] sm:text-sm text-slate-400 mb-2 sm:mb-4 line-clamp-2">{analysis.description}</p>
                    <button
                      onClick={() => runAnalysis(analysis.id)}
                      disabled={loading[analysis.id]}
                      className={`w-full py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition ${
                        loading[analysis.id]
                          ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          : analysisResults[analysis.id]
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {loading[analysis.id] ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Running...
                        </>
                      ) : analysisResults[analysis.id] ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          View Results
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run Analysis
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis Results */}
            {Object.entries(analysisResults).map(([key, result]) => (
              <AnalysisResultCard key={key} analysisId={key} result={result} />
            ))}
          </div>
        )}

        {/* Turbines Tab */}
        {activeTab === 'turbines' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Turbine Selector */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-4">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-thin scrollbar-thumb-slate-600">
                <button
                  onClick={() => { setSelectedTurbine(null); fetchPowerCurve(); }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                    !selectedTurbine ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  All Turbines
                </button>
                {scadaSummary?.turbine_statistics?.map((t: any) => (
                  <button
                    key={t.turbine_id}
                    onClick={() => { setSelectedTurbine(t.turbine_id); fetchPowerCurve(t.turbine_id); }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                      selectedTurbine === t.turbine_id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {t.turbine_id}
                  </button>
                ))}
              </div>
            </div>

            {/* Turbine Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Power Curve */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                  Power Curve: {selectedTurbine || 'All Turbines'}
                </h3>
                {powerCurve?.measured_curve && (
                  <ResponsiveContainer width="100%" height={280} className="sm:!h-[350px]">
                    <ComposedChart data={powerCurve.measured_curve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="wind_speed" tick={{ fill: '#9CA3AF' }} />
                      <YAxis tick={{ fill: '#9CA3AF' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="power_p95" fill="#3B82F620" stroke="#3B82F6" strokeDasharray="3 3" name="P95" />
                      <Area type="monotone" dataKey="power_p5" fill="#3B82F620" stroke="#3B82F6" strokeDasharray="3 3" name="P5" />
                      <Line type="monotone" dataKey="power_mean" stroke="#10B981" strokeWidth={3} name="Measured Mean" />
                      <Line 
                        data={powerCurve.manufacturer_curve} 
                        type="monotone" 
                        dataKey="power" 
                        stroke="#F59E0B" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        name="Manufacturer" 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Turbine Comparison */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Turbine Comparison</h3>
                {scadaSummary?.turbine_statistics && (
                  <ResponsiveContainer width="100%" height={280} className="sm:!h-[350px]">
                    <BarChart data={scadaSummary.turbine_statistics} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
                      <YAxis dataKey="turbine_id" type="category" tick={{ fill: '#9CA3AF' }} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="capacity_factor_percent" name="Capacity Factor (%)" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Seasonal Performance */}
            {scadaSummary?.seasonal_data && (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Seasonal Performance</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  {scadaSummary.seasonal_data.map((season: any) => (
                    <div key={season.season} className="bg-slate-700/30 rounded-lg p-3 sm:p-4 text-center">
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">
                        {season.season === 'Winter' ? '❄️' : season.season === 'Spring' ? '🌸' : season.season === 'Summer' ? '☀️' : '🍂'}
                      </div>
                      <h4 className="font-semibold text-white text-sm sm:text-base">{season.season}</h4>
                      <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                        <div className="text-slate-400">Power: <span className="text-white">{season.avg_power_kw} kW</span></div>
                        <div className="text-slate-400">Wind: <span className="text-white">{season.avg_wind_speed_ms} m/s</span></div>
                        <div className="text-slate-400">CF: <span className="text-white">{season.capacity_factor_percent}%</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Analysis Reports</h3>
              <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6">Run analyses from the Analyses tab to generate comprehensive reports.</p>
              
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(analysisResults).length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-slate-400">
                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No analyses have been run yet.</p>
                    <button 
                      onClick={() => setActiveTab('analyses')}
                      className="mt-3 sm:mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      Go to Analyses
                    </button>
                  </div>
                ) : (
                  Object.entries(analysisResults).map(([key, result]) => (
                    <div key={key} className="p-3 sm:p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-white capitalize text-sm sm:text-base">{key.replace(/_/g, ' ')}</h4>
                            <p className="text-xs sm:text-sm text-slate-400">Completed in {result.execution_time_seconds}s</p>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 bg-slate-600 text-slate-300 rounded text-xs sm:text-sm hover:bg-slate-500 transition flex items-center gap-1 w-fit">
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          Export
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Plant Summary Card */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                Plant Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-slate-700/30 rounded-lg">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mx-auto mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-white">{plantInfo?.location || 'France'}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Location</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-slate-700/30 rounded-lg">
                  <Wind className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mx-auto mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-white">{plantInfo?.num_turbines || 4}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Turbines</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-slate-700/30 rounded-lg">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mx-auto mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-white">{plantInfo?.capacity_mw || 8.2} MW</div>
                  <div className="text-xs sm:text-sm text-slate-400">Capacity</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-slate-700/30 rounded-lg">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mx-auto mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-white">{dataOverview?.scada?.date_range?.years || 2} years</div>
                  <div className="text-xs sm:text-sm text-slate-400">Data Period</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-6 sm:mt-8">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4 text-center text-slate-400 text-xs sm:text-sm">
          <span className="hidden sm:inline">OpenOA Wind Farm Analytics Dashboard • Powered by OpenOA v3.2 • Real Data from La Haute Borne Wind Farm</span>
          <span className="sm:hidden">OpenOA Dashboard • La Haute Borne Wind Farm</span>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, subtitle, icon, color, isLoading = false }: { title: string; value: string; subtitle: string; icon: React.ReactNode; color: string; isLoading?: boolean }) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
  };

  const iconColors: Record<string, string> = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur border rounded-xl p-2.5 sm:p-4`}>
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-slate-400 text-[10px] sm:text-sm truncate">{title}</p>
          {isLoading ? (
            <div className="mt-0.5">
              <div className="h-6 sm:h-8 w-20 sm:w-28 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-14 sm:w-20 bg-slate-700/30 rounded animate-pulse mt-1.5" />
            </div>
          ) : (
            <>
              <p className="text-base sm:text-2xl font-bold text-white mt-0.5 truncate">{value}</p>
              <p className="text-slate-500 text-[9px] sm:text-xs mt-0.5 truncate">{subtitle}</p>
            </>
          )}
        </div>
        <div className={`${iconColors[color]} flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>{icon}</div>
      </div>
    </div>
  );
}

function ChartLoader({ height = 280 }: { height?: number }) {
  return (
    <div className={`flex flex-col items-center justify-center`} style={{ height }}>
      <div className="relative">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
        </div>
      </div>
      <p className="text-slate-400 text-sm mt-3 animate-pulse">Loading data...</p>
    </div>
  );
}

function DataSourceCard({ title, records, period, icon, status, isLoading = false }: { title: string; records?: number; period: string; icon: React.ReactNode; status: string; isLoading?: boolean }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="p-1.5 sm:p-2 bg-slate-700 rounded-lg text-blue-400 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">{icon}</div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-white text-sm sm:text-base truncate">{title}</h4>
          {isLoading ? (
            <div className="h-3 w-16 bg-slate-700/50 rounded animate-pulse mt-0.5" />
          ) : (
            <span className="text-[10px] sm:text-xs text-green-400 flex items-center gap-1">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full flex-shrink-0" />
              {status}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Records</span>
          {isLoading ? (
            <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
          ) : (
            <span className="text-white">{records?.toLocaleString() || 'N/A'}</span>
          )}
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Period</span>
          {isLoading ? (
            <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse" />
          ) : (
            <span className="text-white text-[10px] sm:text-xs">{period}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisResultCard({ analysisId, result }: { analysisId: string; result: AnalysisResult }) {
  const [expanded, setExpanded] = useState(true);
  
  const getResultSummary = () => {
    const r = result.results;
    switch (analysisId) {
      case 'aep':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <ResultMetric label="Net AEP" value={`${r.aep_results?.net_energy_gwh} GWh`} />
            <ResultMetric label="P90 Energy" value={`${r.aep_results?.p90_gwh} GWh`} />
            <ResultMetric label="Capacity Factor" value={`${r.capacity_factor_percent}%`} />
            <ResultMetric label="Uncertainty" value={`±${r.aep_results?.uncertainty_percent}%`} />
          </div>
        );
      case 'electrical_losses':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <ResultMetric label="Total Loss" value={`${r.electrical_losses?.total_loss_percent}%`} />
            <ResultMetric label="Energy Lost" value={`${r.electrical_losses?.total_loss_gwh} GWh`} />
            <ResultMetric label="Meter Energy" value={`${r.energy_comparison?.meter_energy_gwh} GWh`} />
            <ResultMetric label="Turbine Energy" value={`${r.energy_comparison?.turbine_energy_gwh} GWh`} />
          </div>
        );
      case 'wake_losses':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <ResultMetric label="Wake Loss" value={`${r.wake_losses?.overall_loss_percent}%`} />
            <ResultMetric label="Energy Impact" value={`${r.wake_losses?.annual_energy_loss_gwh} GWh/yr`} />
            <ResultMetric label="Uncertainty" value={`±${r.wake_losses?.uncertainty_percent}%`} />
            <ResultMetric label="Direction Sectors" value={`${r.direction_dependent_losses?.length || 0}`} />
          </div>
        );
      case 'turbine_gross_energy':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <ResultMetric label="Total Gross" value={`${r.plant_gross_energy?.total_annual_gwh} GWh/yr`} />
            <ResultMetric label="LT Correction" value={`×${r.long_term_adjustment?.correction_factor}`} />
            <ResultMetric label="LT Wind" value={`${r.long_term_adjustment?.long_term_mean_wind_ms} m/s`} />
            <ResultMetric label="Reanalysis" value={r.long_term_adjustment?.reanalysis_product} />
          </div>
        );
      case 'yaw_misalignment':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <ResultMetric label="Avg Misalignment" value={`${r.summary?.avg_absolute_misalignment_deg}°`} />
            <ResultMetric label="Energy Loss" value={`${r.summary?.estimated_fleet_energy_loss_percent}%`} />
            <ResultMetric label="Analyzed" value={`${r.summary?.turbines_analyzed} turbines`} />
            <ResultMetric label="Need Correction" value={`${r.summary?.turbines_needing_correction} turbines`} />
          </div>
        );
      case 'eya_gap':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <ResultMetric label="EYA AEP" value={`${r.eya_predictions?.net_aep_gwh} GWh`} />
            <ResultMetric label="OA AEP" value={`${r.operational_results?.net_aep_gwh} GWh`} />
            <ResultMetric label="Gap" value={`${r.gaps?.net_aep_gap_percent}%`} />
            <ResultMetric label="Primary Factor" value={r.root_cause_analysis?.primary_factor?.slice(0, 20)} />
          </div>
        );
      default:
        return <pre className="text-[10px] sm:text-xs text-slate-400 overflow-auto">{JSON.stringify(r, null, 2)}</pre>;
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
      <div 
        className="p-3 sm:p-4 border-b border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-700/30"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
          <h3 className="font-semibold text-white capitalize text-sm sm:text-base truncate">{analysisId.replace(/_/g, ' ')} Results</h3>
          <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0">• {result.execution_time_seconds}s</span>
        </div>
        <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </div>
      {expanded && (
        <div className="p-3 sm:p-4">
          {getResultSummary()}
          <details className="mt-3 sm:mt-4">
            <summary className="text-xs sm:text-sm text-slate-400 cursor-pointer hover:text-slate-300">View Raw Data</summary>
            <pre className="mt-2 p-2 sm:p-3 bg-slate-900 rounded text-[10px] sm:text-xs text-slate-400 overflow-auto max-h-64 sm:max-h-96">
              {JSON.stringify(result.results, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
      <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1 truncate">{label}</div>
      <div className="text-sm sm:text-lg font-semibold text-white truncate">{value}</div>
    </div>
  );
}
