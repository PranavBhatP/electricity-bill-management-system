'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ConsumptionGraphProps = {
  consumptionData: {
    units: number;
    date: string;
  }[];
  meterNo: string;
};

export default function ConsumptionGraph({ consumptionData, meterNo }: ConsumptionGraphProps) {
  const chartData = {
    labels: consumptionData.map(c => new Date(c.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [
      {
        label: 'Units Consumed',
        data: consumptionData.map(c => c.units),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Consumption History - Meter No: ${meterNo}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units Consumed'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
} 