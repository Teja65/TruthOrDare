import { ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-card' onClick={(event) => event.stopPropagation()}>
        {title && (
          <header className='modal-header'>
            <h3>{title}</h3>
          </header>
        )}
        <div className='modal-body'>{children}</div>
        <button className='modal-close' type='button' onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
