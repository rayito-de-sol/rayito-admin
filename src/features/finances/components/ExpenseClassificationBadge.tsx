import { Badge } from '@/components/ui/badge'
import {
  EXPENSE_CLASSIFICATION_LABELS,
  type ExpenseClassification,
} from '../types/finance.types'

interface ExpenseClassificationBadgeProps {
  classification: ExpenseClassification
}

export const ExpenseClassificationBadge = ({
  classification,
}: ExpenseClassificationBadgeProps) => (
  <Badge variant="outline">
    {EXPENSE_CLASSIFICATION_LABELS[classification] ?? classification}
  </Badge>
)
