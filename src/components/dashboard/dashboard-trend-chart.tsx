'use client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function DashboardTrendChart({ chartData }: { chartData: { labels: string[], registrations: number[], attendances: number[] } }) {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Registrasi Baru',
        data: chartData.registrations,
        borderColor: '#031635',
        backgroundColor: 'rgba(3, 22, 53, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Kehadiran (Check-in)',
        data: chartData.attendances,
        borderColor: '#4b41e1',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          usePointStyle: true,
          boxWidth: 8
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB',
          drawBorder: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  return <Line data={data} options={options as Record<string, unknown>} />
}
