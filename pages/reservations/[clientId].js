/**
 * Material UI date picker - https://material-ui-pickers.dev/
 * Material UI Formik - https://stackworx.github.io/formik-material-ui/docs/guide/getting-started
 */

import MomentUtils from '@date-io/moment'
import { Box, Button, Container, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@material-ui/core"
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { AccountCircle, AddCircle, Phone } from "@material-ui/icons"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"
import {
    KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider
} from '@material-ui/pickers'
import moment from 'moment'
import "moment/locale/zh-tw"
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
        margin: theme.spacing(2, 0),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}))

export default function ClientReservation({ data }) {
    moment.locale('zh-tw')
    const theme = useTheme()
    const classes = useStyles()

    console.log({theme})

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState(new Date())
    const [selectedPeople, setSelectedPeople] = useState('')
    const [availableTables, setAvailableTables] = useState(null)
    const [selectedTable, setSelectedTable] = useState(null)
    const [contactInfo, setContactInfo] = useState({ name: '', phoneNumber: '' })
    const [reservationResponse, setReservationResponse] = useState(null)

    const [validation, setValidation] = useState({
        find: {
            actionEnabled: false,
        },
        reserve: {
            name: {
                valid: null,
                validate: (val) => val && val.length > 0,
            },
            phoneNumber: {
                valid: null,
                validate: (val) => val && val.length == 10
            },
            actionEnabled: () => validation.reserve.name.valid && validation.reserve.phoneNumber.valid
        }
    })

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

        const valid = {
            actionEnabled: event.target.value && event.target.value > 0
        }

        setValidation({ ...validation, find: valid })
    }

    const handleSelectedTable = (event, value) => {
        if (value != null) {
            setSelectedTable(value)
        }
    }

    const handleName = (event) => {

        const name = event.target.value

        setContactInfo({
            ...contactInfo, name: name
        })

        const reserve = Object.assign(validation.reserve)
        reserve.name.valid = !!reserve.name.validate(name)

        setValidation({ ...validation, reserve })
    }

    const handlePhoneNumber = (event) => {

        const phoneNumber = event.target.value

        setContactInfo({
            ...contactInfo, phoneNumber: phoneNumber
        })

        const reserve = Object.assign(validation.reserve)
        reserve.phoneNumber.valid = !!reserve.phoneNumber.validate(phoneNumber)

        setValidation({ ...validation, reserve })

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
            tableIds: [selectedTable]
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
                <title>{data.clientName}</title>
            </Head>
            <Container maxWidth="sm">
                <Box display="flex" justifyContent="center">
                    <h1 className={utilStyles.heading2Xl}>{data.clientName} - 新增訂位</h1>
                </Box>
                <MuiPickersUtilsProvider utils={MomentUtils} locale="zh-tw">
                    <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
                        <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
                            <KeyboardDatePicker
                                className={classes.formControl}
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
                                className={classes.formControl}
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

                            <Button variant="contained" color="primary" size="large"
                                disabled={!validation.find.actionEnabled}
                                onClick={() => handleFindReservation(data.id)}>
                                尋找訂位
                            </Button>
                        </Box>
                        <Box my={5}>
                            {availableTables && (
                                <Typography variant="h6">選擇時段: {moment(selectedDate).format('MMMDD')} {moment(selectedTime).format('HH:mm')}</Typography>
                            )}

                            {availableTables && availableTables.length == 0 && (
                                <Typography color="textSecondary">您輸入的時段跟人數找不到可訂的位子</Typography>
                            )}

                            {availableTables && availableTables.length > 0 && (
                                <Box display="flex" flexDirection="column">
                                    <Typography variant="h6">請選擇桌位 {selectedTable ? '(已選)' : ''}</Typography>
                                    <Box m={2}>
                                        <ToggleButtonGroup size="medium" aria-label="session" exclusive
                                            value={selectedTable} onChange={handleSelectedTable}>
                                            {availableTables.map(tid => {
                                                return (
                                                    <ToggleButton key={tid} value={tid} aria-label="table">
                                                        <AddCircle/>
                                                    </ToggleButton>
                                                )
                                            })}
                                        </ToggleButtonGroup>
                                    </Box>
                                    {selectedTable && (
                                        <>
                                            <Box m={2}>
                                                <TextField required id="name" label="訂位大名" variant="outlined"
                                                    value={contactInfo.name}
                                                    onChange={handleName}
                                                    error={validation.reserve.name.valid != null && !validation.reserve.name.valid}
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
                                                    error={validation.reserve.phoneNumber.valid != null && !validation.reserve.phoneNumber.valid}
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
                                                <Button disabled={!validation.reserve.actionEnabled()} onClick={() => handleReservation(data.id)} variant="contained" color="primary" size="large">確認訂位</Button>
                                            </Box>
                                        </>
                                    )}
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