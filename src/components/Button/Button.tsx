import type { ReactNode } from 'react';
import styles from './Button.module.css';

export interface IButtonProps{
    children: ReactNode;
    variant?:"primary" | "secondary" | "grey" | "disabled";
    type?:"button" | "submit" | "reset";
    onClick?:()=>void;
    disabled?:boolean
}

export const Button : React.FC<IButtonProps> = ({
    children,
    variant = "primary",
    type = "button",
    onClick,
    disabled = false,
}) =>{
    const getVariantClass = () =>{
        switch(variant){
            case 'primary':
                return styles.primary
            case 'secondary':
                return styles.secondary
            case 'grey':
                return styles.grey
            case 'disabled':
                return styles.disabled
            default :
            return styles.primary
        }
    };
    return(
        <button
        type = {type}
        className={`$styles.button ${getVariantClass()}`}
        onClick={onClick}
        disabled={disabled || variant === 'disabled'}>
            {children}
        </button>
    )
}