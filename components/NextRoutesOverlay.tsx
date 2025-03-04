import postJson from "@/hooks/api/Post";
import { QR_codeIcon } from '@/hooks/images';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Clipboard from 'expo-clipboard';
import React, { FC, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { FooterButtonsComponent } from './create_route/FooterButtonsComponent';

interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    markerOrder: number;
}

interface AnswerData {
    id: number;
    text: string;
    isRight: boolean;
}

type RouteData = {
    marker: MarkerData;
    question?: string;
    answers?: AnswerData[];
}

type ResponseData = {
    error: boolean | string;
    message: string;
}

interface SendData {
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
        const result: SendData = {
            data: currentRoutes,
            name: routeName,
            city: routeCity,
            description: routeDescription,
        }

        const url = '/add/routes'
        const response = await postJson<SendData, ResponseData>(url, result)
        console.log(response);

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

    return !showNext ? (
        <View style={styles.container}>
            <TextInput
                placeholder={'Name the route'}
                style={styles.input}
                value={routeName}
                onChangeText={text => setRouteName(text)}
            />
            <TextInput
                placeholder={'City'}
                style={styles.input}
                value={routeCity}
                onChangeText={city => setRouteCity(city)}
            />
            <TextInput
                placeholder={'Description'}
                multiline={true}
                style={styles.textaria}
                value={routeDescription}
                onChangeText={desc => setRouteDescription(desc)}
            />
            <FooterButtonsComponent.CancelAndFinishButtons
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