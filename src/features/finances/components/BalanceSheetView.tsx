import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/utils/currency'
import { financesApi } from '../api/financesApi'
import { BalanceItemFormModal } from './BalanceItemFormModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type {
  BalanceItem,
  BalanceItemType,
  BalanceSheet,
} from '../types/finance.types'
import { toast } from '@/utils/toast'
import { Pencil, Plus, Trash2 } from 'lucide-react'

interface BalanceSheetViewProps {
  sheet: BalanceSheet
  canEdit: boolean
  onRefresh: () => void
}

/**
 * BalanceSheetView
 * Balance general actual: activos derivados (inventario, cuentas por cobrar),
 * ítems manuales (bancos, préstamos) y patrimonio calculado.
 */
export const BalanceSheetView = ({
  sheet,
  canEdit,
  onRefresh,
}: BalanceSheetViewProps) => {
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BalanceItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<BalanceItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [defaultType, setDefaultType] = useState<BalanceItemType>('asset')

  const openCreate = (type: BalanceItemType) => {
    setEditingItem(null)
    setDefaultType(type)
    setFormOpen(true)
  }

  const openEdit = (item: BalanceItem) => {
    setEditingItem(item)
    setDefaultType(item.item_type)
    setFormOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    setDeleting(true)
    try {
      await financesApi.deleteBalanceItem(deletingItem.id)
      toast.success('Ítem eliminado')
      setDeletingItem(null)
      onRefresh()
    } catch (err) {
      console.error('Error eliminando ítem de balance:', err)
      toast.error(err instanceof Error ? err.message : 'Error al eliminar el ítem')
    } finally {
      setDeleting(false)
    }
  }

  const manualItemRow = (item: BalanceItem) => (
    <TableRow key={item.id}>
      <TableCell>
        <div>{item.name}</div>
        {item.notes && (
          <div className="text-xs text-muted-foreground">{item.notes}</div>
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(item.amount)}
      </TableCell>
      {canEdit && (
        <TableCell className="w-24">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(item)}
              aria-label="Editar ítem"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeletingItem(item)}
              aria-label="Eliminar ítem"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Balance al {formatDate(sheet.as_of)}. El inventario y las cuentas por
        cobrar se calculan automáticamente; los demás ítems se administran
        manualmente.
      </p>

      {/* Activos */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Activos</h3>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCreate('asset')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar activo
            </Button>
          )}
        </div>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <div>Inventario</div>
                <div className="text-xs text-muted-foreground">
                  Stock × costo activo del producto
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(sheet.inventory)}
              </TableCell>
              {canEdit && <TableCell className="w-24" />}
            </TableRow>
            <TableRow>
              <TableCell>
                <div>Cuentas por cobrar</div>
                <div className="text-xs text-muted-foreground">
                  Cuentas de cobro activas sin pagar
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(sheet.accounts_receivable)}
              </TableCell>
              {canEdit && <TableCell className="w-24" />}
            </TableRow>
            {sheet.manual_assets.map(manualItemRow)}
            <TableRow className="bg-muted/50">
              <TableCell className="font-semibold">Total activos</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(sheet.total_assets)}
              </TableCell>
              {canEdit && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Pasivos */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pasivos</h3>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCreate('liability')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar pasivo
            </Button>
          )}
        </div>
        <Table>
          <TableBody>
            {sheet.liabilities.length === 0 && (
              <TableRow>
                <TableCell className="text-sm text-muted-foreground">
                  Sin pasivos registrados
                </TableCell>
                <TableCell />
                {canEdit && <TableCell className="w-24" />}
              </TableRow>
            )}
            {sheet.liabilities.map(manualItemRow)}
            <TableRow className="bg-muted/50">
              <TableCell className="font-semibold">Total pasivos</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(sheet.total_liabilities)}
              </TableCell>
              {canEdit && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Patrimonio */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Patrimonio (calculado)</h3>
            <p className="text-xs text-muted-foreground">
              Total activos − total pasivos
            </p>
          </div>
          <span
            className={`text-xl font-bold ${sheet.equity < 0 ? 'text-destructive' : ''}`}
          >
            {formatCurrency(sheet.equity)}
          </span>
        </div>
      </Card>

      <BalanceItemFormModal
        open={formOpen}
        item={editingItem}
        defaultType={defaultType}
        onClose={() => setFormOpen(false)}
        onSuccess={onRefresh}
      />

      <ConfirmDialog
        open={!!deletingItem}
        title="Eliminar ítem del balance"
        description={deletingItem ? `¿Eliminar "${deletingItem.name}" del balance?` : ''}
        warning="Esta acción es permanente y no se puede deshacer."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  )
}
