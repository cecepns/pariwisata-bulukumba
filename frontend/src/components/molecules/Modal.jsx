import React, { useEffect } from 'react';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <Card 
        className={`w-full ${sizes[size] || sizes.md} max-h-[90vh] overflow-y-auto ${className}`}
        {...props}
      >
        {(title || showCloseButton) && (
          <Card.Header className="flex items-center justify-between border-b border-base-content/10 pb-4">
            {title && (
              <h2 className="text-xl font-semibold text-base-content">{title}</h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="btn-circle btn-sm"
              >
                ✕
              </Button>
            )}
          </Card.Header>
        )}
        
        <Card.Body className="pt-4">
          {children}
        </Card.Body>
      </Card>
    </div>
  );
};

// Modal Footer Component
Modal.Footer = ({ children, className = '', ...props }) => (
  <div className={`flex justify-end space-x-3 pt-4 border-t border-base-content/10 ${className}`} {...props}>
    {children}
  </div>
);

// Confirm Modal Component
Modal.Confirm = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya',
  cancelText = 'Tidak',
  variant = 'error',
  loading = false,
  ...props
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="space-y-4">
        <p className="text-base-content/80">{message}</p>
        
        <Modal.Footer>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default Modal;
