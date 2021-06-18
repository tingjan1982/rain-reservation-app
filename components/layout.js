import Head from 'next/head'
import Image from 'next/image'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { makeStyles, styled, Typography } from '@material-ui/core'

const name = 'Rain App'
export const siteTitle = 'Rain Web App'

export default function Layout({ children, home }) {

    const useStyles = makeStyles({
        footer: {
            'text-align': 'center',
            bottom: 0,
            width: '100% !important',
            'height': '100px !important',
            background: '#232423',
            color: '#e8ede8'
        }
    })

    const classes = useStyles()

    return (
        <>
            <div className={styles.container}>
                <Head>
                    <link rel="icon" href="/favicon.ico" />
                    <meta
                        name="description"
                        content="Rain App Reservation"
                    />
                    <meta
                        property="og:image"
                        content={`https://og-image.vercel.app/${encodeURI(
                            siteTitle
                        )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
                    />
                    <meta name="og:title" content={siteTitle} />
                    <meta name="twitter:card" content="summary_large_image" />
                </Head>
                <header className={styles.header}>
                    {home ? (
                        <>
                            <Image
                                priority
                                src="/images/rain-icon.png"
                                className={utilStyles.borderCircle}
                                height={144}
                                width={144}
                                alt={name}
                            />
                            <h1 className={utilStyles.heading2Xl}>{name}</h1>
                        </>
                    ) : (
                        <>

                        </>
                    )}
                </header>
                <main>{children}</main>
                {!home && (
                    <div className={styles.backToHome}>
                        <Link href="/">
                            <a>← Back to home</a>
                        </Link>
                    </div>
                )}
            </div>
            <footer className={classes.footer}>
                <Typography>Powered by Rain App</Typography>                
                <Typography variant="caption" display="block" gutterBottom>&copy; 2021 Atlas Digital Marketing Technology Inc.</Typography>                
            </footer>
        </>
    )
}