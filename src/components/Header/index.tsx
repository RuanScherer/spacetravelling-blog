import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
