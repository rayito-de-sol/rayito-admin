import { Badge } from '@/components/ui/badge'
import {
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from '../types/finance.types'

interface ExpenseCategoryBadgeProps {
  category: ExpenseCategory
}

export const ExpenseCategoryBadge = ({
  category,
}: ExpenseCategoryBadgeProps) => (
  <Badge variant="secondary">
    {EXPENSE_CATEGORY_LABELS[category] ?? category}
  </Badge>
)
