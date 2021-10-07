/* eslint-disable @next/next/no-html-link-for-pages */


import { SingInButton } from '../SignInButton';

import styles from './styles.module.scss';

export function Header() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <img src='/images/logo.svg' alt='ig.news' />
                <nav>
                    <a href="/">
                        <a>Home</a>
                    </a>
                    <a href="#">
                        <a>Posts</a>
                    </a>
                </nav>
                <SingInButton />
            </div>
        </header>
    )
}