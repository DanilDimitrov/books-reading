import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import styles from './LogoutModal.module.css';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void; 
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const handleLogoutClick = () => {
    onLogout();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <p className={styles.text}>
          Якщо Ви вийдете з програми, незбережені дані будуть втрачені.
        </p>

        <div className={styles.buttonGroup}>
          <Button variant="secondary" onClick={onClose}>
            Відміна
          </Button>
          <Button variant="primary" onClick={handleLogoutClick}>
            Вийти
          </Button>
        </div>
      </div>
    </Modal>
  );
};