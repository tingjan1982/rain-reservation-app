import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'
import Link from 'next/link'
import Date from '../components/date'
import { Box, Typography } from '@material-ui/core'

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <Typography>Rain App 網路訂位 - 帶給您即時訂位功能</Typography>
          <Typography>請到 <a href="https://rain-app.io">Rain App</a> 查看更多詳細產品資訊</Typography>
        </Box>
      </section>
      <section>
        <h1>Release Note</h1>
        <a href="https://www.notion.so/Rain-App-38779bb132404fbe821ede58a7765e35">Details</a>
      </section>
      {/* <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section> */}
    </Layout>
  )
}