import React from 'react';
import styles from './Loader.module.css';

export interface LoaderProps{
    text?:string;
}

export const Loader :  React.FC<LoaderProps> = ({text})=>{
    return(
        <div className={styles.loaderWrapper}>
            <div className={styles.spinner}></div>
            {text && <p className={styles.loaderText}>{text}</p>}
        </div>
    )
}
