// Button Component Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'ghost' | 'outline' | 'soft' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

// Input Component Types
export interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  [key: string]: any;
}

// Textarea Component Types
export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helperText?: string;
  rows?: number;
  [key: string]: any;
}

// Select Component Types
export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helperText?: string;
  [key: string]: any;
}

// Card Component Types
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  shadow?: string;
  border?: string;
  hover?: boolean;
  [key: string]: any;
}

// Badge Component Types
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}

// Loading Component Types
export interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity';
  text?: string;
  className?: string;
  [key: string]: any;
}

// DataTable Component Types
export interface DataTableColumn {
  key: string;
  title: string;
  type?: 'text' | 'badge' | 'date' | 'number';
  badgeVariant?: string;
  render?: (value: any, item: any) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps {
  data: any[];
  columns: DataTableColumn[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  [key: string]: any;
}

// Form Component Types
export interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitText?: string;
  submitVariant?: string;
  className?: string;
  [key: string]: any;
}

// Modal Component Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  [key: string]: any;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: string;
  loading?: boolean;
  [key: string]: any;
}

// Alert Component Types
export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  showIcon?: boolean;
  className?: string;
  [key: string]: any;
}
