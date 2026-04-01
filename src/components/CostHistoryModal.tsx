import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import type { VariantCost } from '@/types/variant'
import type { PackageCost } from '@/types/package'

interface CostHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: 'variant' | 'package'
  entityId: string
  fetchHistory: (id: string) => Promise<VariantCost[] | PackageCost[]>
}

type CostRecord = VariantCost | PackageCost

/**
 * CostHistoryModal
 * Reusable modal for displaying cost history for variants or packages
 */
export const CostHistoryModal = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  fetchHistory,
}: CostHistoryModalProps) => {
  const [history, setHistory] = useState<CostRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen, entityId])

  /**
   * Handle ESC key to close modal
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchHistory(entityId)
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (!isOpen) return null

  const entityName = entityType === 'variant' ? 'variante' : 'empaque'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Historial de Costos</h2>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Cargando historial...</p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="rounded-md bg-muted/50 p-4 text-center text-muted-foreground">
            Solo existe el costo actual para esta {entityName}
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-3">
            {history.map((record) => (
              <Card key={record.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(record.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vigente desde: {formatDate(record.effective_date)}
                    </p>
                    {record.superseded_at && (
                      <p className="text-sm text-muted-foreground">
                        Reemplazado el: {formatDate(record.superseded_at)}
                      </p>
                    )}
                  </div>
                  <div>
                    {!record.superseded_at ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                        Reemplazado
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  )
}
