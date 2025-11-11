import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActivityHistory } from '../lib/api'
import useAuthUser from '../hooks/useAuthUser'
import ActivityItem from '../components/ActivityItem'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Video, DollarSign } from 'lucide-react'

const ActivityPage = () => {
  const { authUser } = useAuthUser()
  
  const { data: activityData, isLoading } = useQuery({
    queryKey: ["activity-history"],
    queryFn: getActivityHistory,
    enabled: !!authUser,
  })

  // Procesar datos para los gráficos (últimos 12 meses)
  const chartData = useMemo(() => {
    if (!activityData?.activities) return { classes: [], payments: [] }

    const now = new Date()
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    // Generar los últimos 12 meses desde hoy
    const last12Months = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = `${months[date.getMonth()]} ${date.getFullYear()}`
      last12Months.push({
        key: monthKey,
        label: monthLabel,
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date
      })
    }
    
    // Inicializar datos para los últimos 12 meses
    const classesData = last12Months.map(m => ({ month: m.label, count: 0, key: m.key }))
    const paymentsData = last12Months.map(m => ({ month: m.label, amount: 0, key: m.key }))

    // Calcular la fecha límite (inicio del mes hace 12 meses)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    activityData.activities.forEach(activity => {
      const date = new Date(activity.data.createdAt)
      
      // Solo procesar actividades de los últimos 12 meses (desde el inicio del mes más antiguo)
      if (date >= twelveMonthsAgo && date <= now) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const monthIndex = last12Months.findIndex(m => m.key === monthKey)
        
        if (monthIndex !== -1) {
          if (activity.type === 'virtual_class') {
            classesData[monthIndex].count += 1
          } else if (activity.type === 'payment') {
            // Solo contar pagos aprobados
            if (activity.data.status === 'approved') {
              paymentsData[monthIndex].amount += activity.data.amount
            }
          }
        }
      }
    })

    return {
      classes: classesData,
      payments: paymentsData
    }
  }, [activityData])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Izquierdo - Historial */}
          <div className="lg:col-span-2 flex flex-col lg:h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="mb-6 animate-fade-in flex-shrink-0">
              <h1 className="text-4xl font-bold text-black mb-2">
                Historial de Actividad
              </h1>
              <p className="text-lg text-gray-600">
                Revisa todas tus acciones y transacciones en la plataforma
              </p>
            </div>

            {/* Resumen Fijo */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 flex-shrink-0 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Video className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Clases Virtuales</p>
                    <p className="text-2xl font-bold text-black">{activityData?.totalVirtualClasses || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pagos</p>
                    <p className="text-2xl font-bold text-black">{activityData?.totalPayments || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Actividades con Scroll */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 activity-scroll">
              {activityData?.activities?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500 text-lg">No hay actividad registrada</p>
                </div>
              ) : (
                activityData?.activities?.map((activity, index) => (
                  <ActivityItem 
                    key={`${activity.type}-${activity.id}`} 
                    activity={activity}
                  />
                ))
              )}
            </div>
          </div>

          {/* Panel Derecho - Gráficos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Gráfico de Clases Virtuales */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Clases por Mes
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.classes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Clases"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Últimos 12 meses
              </p>
            </div>

            {/* Gráfico de Pagos */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pagos por Mes
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.payments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [
                      new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS'
                      }).format(value),
                      'Monto'
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Monto ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Últimos 12 meses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityPage
