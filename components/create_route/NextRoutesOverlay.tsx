import postJson from "@/hooks/api/Post";
import { QR_codeIcon } from '@/hooks/images';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Clipboard from 'expo-clipboard';
import React, { FC, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ButtonsComponent } from './ButtonsComponent';
import { RouteData } from '@/interfaces/common';
import globals from '@/hooks/globals';
import CityComponent from './CityComponent';
import Spacer from '../Spacer'


type ResponseData = {
    error: boolean | string;
    message: string;
}

interface SendData {
    owner: number;
    data: RouteData[];
    name: string;
    city: string;
    description: string;
}

interface Props {
    currentRoutes: RouteData[];
    onFinish: () => void;
    onClose: () => void;
}


const NextRoutesOverlay: FC<Props> = ({ currentRoutes, onFinish, onClose }) => {
    const [routeName, setRouteName] = useState<string>('')
    const [routeCity, setRouteCity] = useState<string>('')
    const [routeDescription, setRouteDescription] = useState<string>('')

    const [qrCodeName, setQrCodeName] = useState<string>('')
    const [showNext, setShowNext] = useState<boolean>(false);


    //TBD: Det finns inga checkar på om stad, namn och beskrivning är ifyllda
    const handleFinishPress = async () => {
        let userId = -1
        if (globals.userId) userId = globals.userId
        else {
            Alert.alert('Your app has not identify it self')
            return
        }

        const result: SendData = {
            owner: userId,
            data: currentRoutes,
            name: routeName,
            city: routeCity,
            description: routeDescription,
        }

        const url = '/add/routes'
        const response = await postJson<SendData, ResponseData>(url, result)

        if (response.error) {
            Alert.alert('Something went wrong', response.error as string)
        } else {
            //Alert.alert('The route is now saved')
            setQrCodeName(routeName)
            setShowNext(true)
        }
        setRouteCity('')
        setRouteDescription('')
        setRouteName('')

        onFinish()
    }

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(qrCodeName);
    }

    const getCitys= () => {
        const result = currentRoutes.map(route => route.marker.city)
        type uniqueArr = Set<string>;
        const uniqueSet: uniqueArr = new Set(result);
        return [...uniqueSet]
    }

    const handeOnChangeCity = (citys: string[]) => {
        setRouteCity(citys.join(', '))
    }

    return !showNext ? (
        <View style={styles.container}>
            <TextInput
                placeholder={'Name the route'}
                style={styles.input}
                value={routeName}
                onChangeText={text => setRouteName(text)}
            />
            <CityComponent
                citys={getCitys()}
                onChange={handeOnChangeCity}
            />
            <TextInput
                placeholder={'Description'}
                multiline={true}
                style={styles.textaria}
                value={routeDescription}
                textAlignVertical={'top'}
                onChangeText={desc => setRouteDescription(desc)}
            />
            <ButtonsComponent.CancelAndFinishButtons
                onFinish={handleFinishPress}
                onCancel={onClose}
            />
        </View>
    ) : (
        <View style={styles.container}>
            <Text>Your route is published!!!</Text>
            <Text>{"\n"}</Text>
            <View style={styles.row}>
                <Text style={{ marginTop: 15 }}>{qrCodeName} </Text>
                <FontAwesome6.Button
                    name="copy"
                    backgroundColor={"transparent"}
                    size={32}
                    color="black"
                    onPress={async () => await copyToClipboard()}
                />
            </View>
            <Text>{"\n"}{"\n"}{"\n"}</Text>
            <QRCode
                value={qrCodeName}
                size={150}
                logo={{ uri: QR_codeIcon }}
                logoSize={40}
                logoBackgroundColor='transparent'
                logoBorderRadius={5}
            />
            <Spacer size={20} />
            <Button title={'Close'} onPress={() => onClose()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
        padding: 10,
    },
    row: {
        flexDirection: 'row',
    },
    textaria: {
        height: 150,
        width: '100%',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10
    },
    input: {
        height: 40,
        width: '100%',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10
    },

});

export default NextRoutesOverlay