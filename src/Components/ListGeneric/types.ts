export interface IListItemsProps<T> {
  items: T[];
  label?: string;
  path?: string;
  onDelete: (id: string) => void;
  renderItem: (item: T) => React.ReactNode; // <- função para renderizar
}