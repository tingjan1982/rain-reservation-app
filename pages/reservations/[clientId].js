/**
 * Material UI date picker - https://material-ui-pickers.dev/
 * Material UI Formik - https://stackworx.github.io/formik-material-ui/docs/guide/getting-started
 */

import MomentUtils from '@date-io/moment'
import { Box, Button, Container, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import { AccountCircle, Phone } from "@material-ui/icons"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"
import {
    KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider
} from '@material-ui/pickers'
import moment from 'moment'
import Head from "next/head"
import React, { useState } from 'react'
import Layout from "../../components/layout"
import utilStyles from '../../styles/utils.module.css'

const getClient = async (id) => {

    const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/clients/${id}`, {
        'headers': {
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

    const [data, error] = await getClient(params.clientId)


    // notFound: true will cause page to return 404 page not found.
    if (!error.ok) {
        return {
            notFound: true
        }
    }

    return { props: { data } }
}

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(3, 0),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}))

export default function ClientReservation({ data }) {
    const classes = useStyles()

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState(new Date())
    const [selectedPeople, setSelectedPeople] = useState('')
    const [availableTables, setAvailableTables] = useState(null)
    const [selectedSession, setSelectedSession] = useState(null)
    const [contactInfo, setContactInfo] = useState({ name: '', phoneNumber: '' })
    const [reservationResponse, setReservationResponse] = useState(null)


    const handleDateChange = (date, value) => {
        console.log('selected date', value)

        setSelectedDate(date)
    }

    const handleTimeChange = (date, value) => {
        console.log('selected time', value)

        setSelectedTime(date)
    }

    const handleSelectedPeople = (event) => {

        setSelectedPeople(event.target.value)
    }

    const handleSelectedSession = (event, value) => {
        if (value != null) {
            setSelectedSession(value)
        }
    }

    const handleName = (event) => {

        setContactInfo({
            ...contactInfo, name: event.target.value
        })
    }

    const handlePhoneNumber = (event) => {

        setContactInfo({
            ...contactInfo, phoneNumber: event.target.value
        })
    }

    const handleFindReservation = async (clientId) => {
        const request = {
            reservationDate: `${moment(selectedDate).format('YYYY-MM-DD')}T${moment(selectedTime).format('HH:mm:00')}`,
            people: selectedPeople
        }

        console.log('Finding tables request', request)

        const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/clients/${clientId}/findTables`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY
            },
            body: JSON.stringify(request)
        })

        const data = await res.json()

        setAvailableTables(data.results)
    }

    const handleReservation = async (clientId) => {

        const request = {
            reservationDate: `${moment(selectedDate).format('YYYY-MM-DD')}T${moment(selectedTime).format('HH:mm:00')}`,
            people: selectedPeople,
            name: contactInfo.name,
            phoneNumber: contactInfo.phoneNumber,
            tableIds: [selectedSession]
        }

        console.log('Reservation request', request)

        const res = await fetch(`${process.env.NEXT_PUBLIC_RAIN_HOST}/web-reservations/clients/${clientId}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY
            },
            body: JSON.stringify(request)
        })

        const data = await res.json()
        console.log('Reservation response', data)

        if (res.ok) {
            setReservationResponse(data)
        }
    }

    return (
        <Layout>
            <Head>
                <title>New Reservation</title>
            </Head>
            <Container maxWidth="sm">
                <Box display="flex" justifyContent="center">
                    <h1 className={utilStyles.heading2Xl}>{data.clientName} - 新增訂位</h1>
                </Box>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
                        <KeyboardDatePicker
                            margin="normal"
                            id="reservationDate"
                            label="選擇欲訂位日期"
                            format="MM/DD/yyyy"
                            value={selectedDate}
                            onChange={handleDateChange}
                            minDate={new Date()}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />

                        <KeyboardTimePicker
                            label="選擇時間"
                            value={selectedTime}
                            minutesStep={15}
                            onChange={handleTimeChange}
                        />

                        <FormControl className={classes.formControl}>
                            <InputLabel id="demo-simple-select-label">人數</InputLabel>
                            <Select
                                labelId="selectedPeopleLabel"
                                id="selectedPeople"
                                value={selectedPeople}
                                onChange={handleSelectedPeople}
                            >
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                            </Select>
                        </FormControl>

                        {/* <ToggleButtonGroup size="medium" value={selectedSession} exclusive onChange={handleSelectedSession} aria-label="session">
                            <ToggleButton value="morning" aria-label="Morning">
                                早上
                            </ToggleButton>
                            <ToggleButton value="noon" aria-label="Noon">
                                中午
                            </ToggleButton>
                            <ToggleButton value="evening" aria-label="Evening">
                                晚上
                            </ToggleButton>
                        </ToggleButtonGroup> */}

                        <Button onClick={() => handleFindReservation(data.id)} variant="contained" color="primary" size="large">尋找訂位</Button>

                        <Box m={5}>
                            {availableTables && (
                                <Typography variant="h6">選擇時段: {moment(selectedDate).format('YYYY-MM-DD')}, {moment(selectedTime).format('HH:mm:00')}</Typography>
                            )}

                            {availableTables && availableTables.length == 0 && (
                                <Typography>您輸入的時段跟人數找不到可訂的位子。</Typography>
                            )}

                            {availableTables && availableTables.length > 0 && (
                                <Box display="flex" flexDirection="column">
                                    <Typography variant="h6">請選擇桌位 {selectedSession ? '已選' : ''}</Typography>
                                    <Box m={2}>
                                        <ToggleButtonGroup size="medium" value={selectedSession} exclusive onChange={handleSelectedSession} aria-label="session">
                                            {availableTables && availableTables.map(tid => {
                                                return (
                                                    <ToggleButton key={tid} value={tid} aria-label="table">
                                                        桌子
                                                    </ToggleButton>
                                                )
                                            })}
                                        </ToggleButtonGroup>
                                    </Box>
                                    <Box m={2}>
                                        <TextField required id="name" label="訂位大名" variant="outlined"
                                            value={contactInfo.name}
                                            onChange={handleName}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AccountCircle />
                                                    </InputAdornment>
                                                ),
                                            }} />
                                    </Box>
                                    <Box m={2}>
                                        <TextField required id="phooneNumber" label="聯絡電話" variant="outlined"
                                            value={contactInfo.phoneNumber}
                                            onChange={handlePhoneNumber}
                                            helperText="請輸入手機號碼"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Phone />
                                                    </InputAdornment>
                                                ),
                                            }} />
                                    </Box>
                                    <Box m={2}>
                                        <Button onClick={() => handleReservation(data.id)} variant="contained" color="primary" size="large">確認訂位</Button>
                                    </Box>
                                    {reservationResponse && (
                                        <Box m={2}>
                                            <Typography variant="h6">訂位成功</Typography>
                                            <div>訂位資訊將會傳送到您的手機裡。
                                                <a target="_blank" href={`https://r.rain-app.io/r/${reservationResponse.id}`}>查看訂位</a>
                                            </div>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </MuiPickersUtilsProvider>
            </Container>
        </Layout>
    )

}