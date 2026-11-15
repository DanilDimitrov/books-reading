import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './Modal.module.css';


export interface ModalProps{
    isOpen?:boolean;
    onClose:()=>void;
    children?:ReactNode;
}

export const Modal : React.FC<ModalProps>=({isOpen, onClose, children})=>{
    useEffect(()=>{
        if(!isOpen) return

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e:KeyboardEvent)=>{
            if(e.key === 'Escape'){
                onClose();
            }
        }
        window.addEventListener('keydown', handleKeyDown);

        return () => {
        document.body.style.overflow = 'unset'; 
        window.removeEventListener('keydown', handleKeyDown);
    };
    },[isOpen, onClose]);

    if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return(
    <div className={styles.backDrop} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
            {children}
        </div>
    </div>
  )
}