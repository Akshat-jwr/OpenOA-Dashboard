'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { CheckCircle, TrendingUp, Zap, Wind } from 'lucide-react';

interface ResultsPanelProps {
  results: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ResultsPanel({ results }: ResultsPanelProps) {
  const { analysis_type, results: data, timestamp } = results;

  const renderAEPResults = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Gross Energy"
          value={`${data.gross_energy_gwh} GWh/yr`}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <MetricCard
          label="Net Energy"
          value={`${data.net_energy_gwh} GWh/yr`}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <MetricCard
          label="Capacity Factor"
          value={`${(data.capacity_factor * 100).toFixed(1)}%`}
          icon={Zap}
          color="bg-yellow-500"
        />
        <MetricCard
          label="Uncertainty"
          value={`±${data.uncertainty_percent}%`}
          icon={Wind}
          color="bg-purple-500"
        />
      </div>

      {/* Monthly Production Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Monthly Energy Production
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthly_production}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis label={{ value: 'Energy (GWh)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="energy_gwh" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Info Panel */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Analysis Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Analysis Period:</span>
            <span className="ml-2 font-medium text-slate-900">
              {data.analysis_period_years} years
            </span>
          </div>
          <div>
            <span className="text-slate-600">Turbine Count:</span>
            <span className="ml-2 font-medium text-slate-900">{data.turbine_count}</span>
          </div>
          <div>
            <span className="text-slate-600">Total Capacity:</span>
            <span className="ml-2 font-medium text-slate-900">{data.total_capacity_mw} MW</span>
          </div>
          <div>
            <span className="text-slate-600">Completed:</span>
            <span className="ml-2 font-medium text-slate-900">
              {new Date(timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWakeLossResults = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          label="Total Wake Loss"
          value={`${data.total_wake_loss_percent}%`}
          icon={Wind}
          color="bg-green-500"
        />
        <MetricCard
          label="Energy Lost to Wakes"
          value={`${data.wake_loss_gwh_per_year} GWh/yr`}
          icon={TrendingUp}
          color="bg-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turbine Wake Losses */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Wake Loss by Turbine
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.turbine_wake_losses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turbine" />
              <YAxis label={{ value: 'Loss (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="wake_loss_percent" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Direction Wake Losses */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Wake Loss by Wind Direction
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.wind_direction_wake_losses}>
              <PolarGrid />
              <PolarAngleAxis dataKey="direction" />
              <PolarRadiusAxis />
              <Radar
                name="Wake Loss"
                dataKey="loss_percent"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderElectricalLossResults = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Electrical Loss"
          value={`${data.total_electrical_loss_percent}%`}
          icon={Zap}
          color="bg-yellow-500"
        />
        <MetricCard
          label="Transformer Loss"
          value={`${data.transformer_loss_percent}%`}
          icon={Zap}
          color="bg-orange-500"
        />
        <MetricCard
          label="Line Loss"
          value={`${data.line_loss_percent}%`}
          icon={Zap}
          color="bg-red-500"
        />
      </div>

      {/* Loss Breakdown Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Loss Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Transformer Loss', value: data.transformer_loss_percent },
                  { name: 'Line Loss', value: data.line_loss_percent },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Losses */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Monthly Electrical Losses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly_losses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Loss (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="loss_percent" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Energy Impact</h3>
        <p className="text-slate-700">
          Total electrical losses result in{' '}
          <span className="font-semibold text-red-600">
            {data.electrical_loss_gwh_per_year} GWh/year
          </span>{' '}
          of energy lost between turbine generation and grid delivery.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
          <p className="text-sm text-slate-600 mt-1">
            {analysis_type === 'aep' && 'Annual Energy Production Analysis'}
            {analysis_type === 'wake_losses' && 'Wake Losses Analysis'}
            {analysis_type === 'electrical_losses' && 'Electrical Losses Analysis'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Complete</span>
        </div>
      </div>

      {analysis_type === 'aep' && renderAEPResults()}
      {analysis_type === 'wake_losses' && renderWakeLossResults()}
      {analysis_type === 'electrical_losses' && renderElectricalLossResults()}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: any;
  color: string;
}

function MetricCard({ label, value, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
