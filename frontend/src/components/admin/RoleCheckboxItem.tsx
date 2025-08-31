import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, Loader2 } from "lucide-react"

interface RoleCheckboxItemProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onSelect?: (e: Event) => void
}

export const RoleCheckboxItem = ({
  checked,
  onCheckedChange,
  disabled,
  loading,
  children,
  onSelect,
}: RoleCheckboxItemProps) => {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className="focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      onSelect={onSelect}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {loading ? (
          <Loader2 className="size-3 animate-spin text-emerald-600 dark:text-emerald-500" />
        ) : (
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-500" />
          </DropdownMenuPrimitive.ItemIndicator>
        )}
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}
