import { Box, Button, Card, CardContent, Container, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, Typography } from '@material-ui/core'
import moment from 'moment'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Layout from '../../components/layout'
import theme from '../../styles/theme'
import utilStyles from '../../styles/utils.module.css'

const getReservation = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/${id}`, {
        'headers': {
            //Authorization: `Basic ${Buffer.from('').toString('base64')}`
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY
        }
    })

    if (!res.ok) {
        console.error(`Get reservation response: ${res.statusText}`)
        return [null, res]
    }

    const data = await res.json()
    return [data, res]
}

export async function getServerSideProps({ params }) {

    const [data, error] = await getReservation(params.id)


    // notFound: true will cause page to return 404 page not found.
    if (!error.ok) {
        return {
            notFound: true
        }
    }

    return { props: { data } }
}

export default function Reservation({ data }) {
    const router = useRouter()
    const { id } = router.query
    moment.locale('zh-tw')
    const status = {
        'BOOKED': '已訂位',
        'WAITING': '候位中',
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

        const [data, error] = await getReservation(id)
        setReservation(data)
    }

    const confirm = async (id) => {

        const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/${id}/confirm`, {
            'method': 'POST',
            'headers': {
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY
            }
        })

        updateReservation()
    }

    const cancel = async (id) => {

        const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/${id}/cancel`, {
            'method': 'POST',
            'headers': {
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY
            }
        })

        updateReservation()
    }

    const [toggleDialog, setToggleDialog] = useState(false)

    const handleOpenDialog = () => {
        setToggleDialog(true)
    }

    const handleCloseDialog = () => {
        setToggleDialog(false)
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
                            <Typography variant="h4">{moment(reservation.reservationStartDate).format('YYYY/MM/DD dddd')}</Typography>
                            <Typography variant="h3" color="secondary" gutterBottom>{moment(reservation.reservationStartDate).format('HH:mmA')}</Typography>
                            <Typography variant="h5" align="center">{reservation.name}</Typography>
                            <Typography variant="h5">{reservation.people}位大人 {reservation.kid > 0 ? `${reservation.kid}位小孩` : ''}</Typography>
                            {reservation.note && (
                                <Box p={2}>
                                    <Typography variant="subtitle1">註記: {reservation.note}</Typography>
                                </Box>
                            )}
                            <Typography variant="h5" gutterBottom>狀態：{status[reservation.status]}</Typography>
                            {reservation.status == 'BOOKED' && (
                                <Box m={2}>
                                    <Button onClick={() => confirm(id)} variant="contained" color="primary" size="large">確認訂位</Button>
                                </Box>
                            )}
                            {['BOOKED', 'CONFIRMED'].includes(reservation.status) && (
                                <Button onClick={() => handleOpenDialog()} variant="outlined" color="primary" size="large">取消訂位</Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Container>
            <ConfirmationDialog toggleDialog={toggleDialog}
                title="取消訂位"
                content="請問您是否確定取消這個訂定?"
                handleCancelAction={() => handleCloseDialog()}
                handleConfirmAction={() => { handleCloseDialog(); cancel(id) }} />
        </Layout>
    )
}

function ConfirmationDialog(props) {

    const { toggleDialog, title, content, handleCancelAction, handleConfirmAction } = props

    return (
        <Dialog
            open={toggleDialog}
            onClose={() => console.log('closed')}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{content}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancelAction} color="primary">
                    Cancel
          </Button>
                <Button onClick={handleConfirmAction} color="primary" autoFocus>
                    Confirm
          </Button>
            </DialogActions>
        </Dialog>
    )
}