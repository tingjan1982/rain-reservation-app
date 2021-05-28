import Layout from '../../components/layout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import utilStyles from '../../styles/utils.module.css'
import { Container, Box, Divider, Button } from '@material-ui/core'


export async function getServerSideProps({ params }) {
    console.log(`passed in id: ${params.id}`)

    const res = await fetch(`${process.env.RAIN_HOST}/web-reservations/${params.id}`, {
        // 'headers': {
        //     Authorization: `Basic ${Buffer.from('admin:nextpos').toString('base64')}`
        // }
    })
    const data = await res.json()

    return { props: { data } }
}

export default function Reservation({ data }) {
    const router = useRouter()
    const { id } = router.query

    return (
        <Layout>
            <Head>
                <title>Rain App Reservation: {data.clientName}</title>
            </Head>
            <Container maxWidth="sm">
                <Box>
                    <h1 className={utilStyles.heading2Xl}>訂位資訊</h1>
                    <Divider />
                </Box>
                <p>Reservation ID: {id}</p>
                <Box>
                <section>
                    <p>{data.reservationDate}</p>
                    <p>{data.name}</p>
                    <p>{data.phoneNumber}</p>
                    <p>{data.people + data.kid}</p>
                </section>
                </Box>
                
                <section>
                    <Button variant="contained" color="primary">Confirm</Button>
                    <Button variant="contained" color="primary">Cancel</Button>
                </section>
            </Container>
        </Layout>
    )
}