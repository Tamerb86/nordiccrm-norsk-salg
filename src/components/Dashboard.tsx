import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { norwegianTranslations as t } from '@/lib/norwegian'
import { formatCurrency, formatNumber, calculateConversionRate } from '@/lib/helpers'
import type { Contact, Deal, Task } from '@/lib/types'
import { Users, CurrencyCircleDollar, Target, CheckCircle } from '@phosphor-icons/react'

export default function Dashboard() {
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [deals] = useKV<Deal[]>('deals', [])
  const [tasks] = useKV<Task[]>('tasks', [])

  const safeContacts = contacts || []
  const safeDeals = deals || []
  const safeTasks = tasks || []

  const openDeals = safeDeals.filter(d => !d.actualCloseDate)
  const wonDeals = safeDeals.filter(d => d.actualCloseDate && !d.lostReason)
  const totalRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0)
  const averageDealValue = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0
  const conversionRate = calculateConversionRate(wonDeals.length, safeDeals.length)
  
  const pendingTasks = safeTasks.filter(t => !t.completed)

  const metrics = [
    {
      title: t.dashboard.totalContacts,
      value: formatNumber(safeContacts.length),
      icon: Users,
      color: 'text-[oklch(0.45_0.12_250)]',
    },
    {
      title: t.dashboard.openDeals,
      value: formatNumber(openDeals.length),
      icon: Target,
      color: 'text-[oklch(0.70_0.12_230)]',
    },
    {
      title: t.dashboard.totalRevenue,
      value: formatCurrency(totalRevenue),
      icon: CurrencyCircleDollar,
      color: 'text-[oklch(0.65_0.15_160)]',
    },
    {
      title: t.dashboard.wonDeals,
      value: formatNumber(wonDeals.length),
      icon: CheckCircle,
      color: 'text-[oklch(0.65_0.15_160)]',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h2>
        <p className="text-muted-foreground mt-1">{t.dashboard.metrics}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon size={20} className={metric.color} weight="duotone" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ytterligere statistikk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t.dashboard.averageDealValue}</span>
              <span className="font-semibold font-mono">{formatCurrency(averageDealValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t.dashboard.conversionRate}</span>
              <span className="font-semibold font-mono">{conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ventende oppgaver</span>
              <span className="font-semibold font-mono">{formatNumber(pendingTasks.length)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontaktstatus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['lead', 'prospect', 'customer', 'lost'].map(status => {
              const count = safeContacts.filter(c => c.status === status).length
              const percentage = safeContacts.length > 0 ? Math.round((count / safeContacts.length) * 100) : 0
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{status}</span>
                    <span className="font-mono">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {safeContacts.length === 0 && safeDeals.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-dashed">
          <CardContent className="py-12 text-center">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">Velkommen til Norwegian CRM!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Begynn med å legge til dine første kontakter og avtaler. Gå til "Kontakter" for å starte.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
