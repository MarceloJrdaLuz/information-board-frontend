export interface IListItemsProps<T> {
  items: T[]
  label?: string
  path?: string
  onDelete: (id: string) => void
  renderItem: (item: T) => React.ReactNode
  onUpdate?: (item: T) => void
  showActions?: boolean        
  showEdit?: boolean           
  showDelete?: boolean
  paddingBottom?: string
}