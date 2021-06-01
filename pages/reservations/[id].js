import Layout from '../../components/layout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import utilStyles from '../../styles/utils.module.css'
import theme from '../../styles/theme'
import { Container, Grid, Box, Card, CardContent, Divider, Typography, Button } from '@material-ui/core'
import moment from 'moment'
import React, { useState, useEffect } from 'react'
import useSWR from 'swr'

const getReservation = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/${id}`, {
        'headers': {
            //Authorization: `Basic ${Buffer.from('').toString('base64')}`
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY
        }
    })

    return await res.json()
}

export async function getServerSideProps({ params }) {

    const data = await getReservation(params.id)


    // notFound: true will cause page to return 404 page not found.
    // if (data.status == 401) {
    //     return {
    //         notFound: true
    //     }
    // }

    return { props: { data } }
}

export default function Reservation({ data }) {
    const router = useRouter()
    const { id } = router.query
    moment.locale('zh-tw')
    const status = {
        'BOOKED': '已訂位',
        'CONFIRMED': '已確認',
        'CANCELLED': '已取消'
    }

    const fetcher = async (...args) => {
        const res = await fetch(...args)
        return await res.json()
    }

    const [reservation, setReservation] = useState(data)
    useEffect(() => {
        console.log('updated reservation', reservation)

    });

    const updateReservation = async () => {
        // const { data2, error } = useSWR(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/${id}`, fetcher, {
        //     onSuccess: (data, key, config) => {
        //         setReservation(data)
        //     }
        // })

        const data = await getReservation(id)
        setReservation(data)
    }

    const confirm = async (id) => {

        const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/${id}/confirm`, {
            'method': 'POST'
        })

        updateReservation()
    }

    const cancel = async (id) => {

        const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/${id}/cancel`, {
            'method': 'POST'
        })

        updateReservation()
    }

    if (!reservation) {
        return (
            <div>Loading...</div>
        )
    }

    if (reservation.status == 401) {
        return (
            <div>Not authorized...</div>
        )
    }

    return (
        <Layout>
            <Head>
                <title>Rain App Reservation</title>
            </Head>
            <Container maxWidth="sm">
                <Box display="flex" justifyContent="center">
                    <h1 className={utilStyles.heading2Xl}>訂位資訊</h1>
                </Box>
                <Box m={2} border={0} borderRadius={16} borderColor={theme.palette.primary.main} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <Typography variant="h2">{reservation.client.clientName}</Typography>
                    <Typography variant="subtitle2">{reservation.client.phoneNumber}</Typography>
                    <Typography variant="subtitle2">
                        <a href={`https://www.google.com/maps/search/${reservation.client.address}`}>{reservation.client.address}</a>
                    </Typography>
                </Box>
                <Card>
                    <CardContent>
                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                            <Typography variant="h4">{moment(reservation.reservationDate).format('YYYY/MM/DD dddd')}</Typography>
                            <Typography variant="h3" color="secondary" gutterBottom>{moment(reservation.reservationDate).format('HH:mmA')}</Typography>
                            <Typography variant="h5" align="center">{reservation.name}</Typography>
                            <Typography variant="h5">{reservation.people}位大人 {reservation.kid > 0 ? `${reservation.kid}位小孩` : ''}</Typography>
                            <Box p={2}>
                                <Typography variant="subtitle1">註記: {reservation.note}</Typography>
                            </Box>
                            <Typography variant="h5" gutterBottom>狀態：{status[reservation.status]}</Typography>
                            <Box m={2}>
                                <Button onClick={() => confirm(id)} variant="contained" color="primary" size="large">確認訂位</Button>
                            </Box>
                            <Button onClick={() => cancel(id)} variant="outlined" color="primary" size="large">取消訂位</Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Layout>
    )
}