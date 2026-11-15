import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement>{
    label?:string,
    required?:boolean,
    error?:string,
    leftIcon?:ReactNode,
    rightIcon?:ReactNode,
}

export const Input : React.FC<IInputProps>=({
    label,
    required,
    error,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) =>{
    return(
        <div className={styles.inpurWrapper}>
            {label &&(
                <label className={styles.label}>
                    {label} {required && <span className={styles.asterisk}>*</span>}
                </label>
            )}
            <div className={`${styles.inputContainer} ${error ? styles.errorState : ''}`}>
                {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
                <input
                    className={`${styles.input} ${leftIcon ? styles.withLeftIcon : ''} ${rightIcon ? styles.withRightIcon : ''} ${className}`}
                    disabled={disabled}
                    {...props} 
                />
                {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
            </div>
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    )
} 