import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <p className={styles.text}>
          Ти молодчина... Наступного разу тобі все вдасться!
        </p>

        <div className={styles.buttonContainer}>
          <Button variant="primary" onClick={onClose}>
            Закрити
          </Button>
        </div>
      </div>
    </Modal>
  );
};