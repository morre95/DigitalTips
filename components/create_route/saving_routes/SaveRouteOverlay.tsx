import {postJsonWithToken} from "@/functions/api/Post";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Clipboard from 'expo-clipboard';
import React, {useState, useRef, useEffect} from 'react';
import {Alert, StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity} from 'react-native';
import { ButtonsComponent } from '../ButtonsComponent';
import {QrCodeType, RouteData} from '@/interfaces/common';
import CityComponent from './CityComponent';
import Spacer from '../../Spacer'
import {getPlayerId}  from '@/functions/common'
import Loader from "@/components/Loader";
import AreRoutesPrivateAndInOrder from "./AreRoutesPrivateAndInOrder";
import SetStartAndEndTime from "./SetStartAndEndTime";
import {getRouteInfo} from "@/functions/api/Get";
import {useToken} from '@/components/login/LoginContext'
import QrCodeModal from "@/components/QrCodeModal";


type ResponseData = {
    error: boolean | string;
    message: string;
    routId: number;
}

interface SendData {
    routeId: number;
    owner: number;
    data: RouteData[];
    name: string;
    city: string;
    description: string;
    isPrivate: boolean;
    inOrder: boolean;
    startAt: Date | null;
    endAt: Date | null;
}

interface Props {
    currentRoutes: RouteData[];
    onFinish: () => void;
    onClose: () => void;
    alreadyInDb: boolean;
    routeId?: number;
}

const SaveRouteOverlay = ({ currentRoutes, onFinish, onClose, alreadyInDb, routeId }: Props) => {
    const [routeName, setRouteName] = useState<string>('')
    const [routeCity, setRouteCity] = useState<string>('')
    const [routeDescription, setRouteDescription] = useState<string>('')

    const [showNext, setShowNext] = useState<boolean>(false);

    const [nameError, setNameError] = useState<string | null>(null);
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [qrCodeValue, setQrCodeValue] = useState<QrCodeType>({name: '', routeId: -1});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const refPrivateInorder = useRef<{isPrivate: boolean, isInOrder: boolean}>({isPrivate: false, isInOrder: true})
    const refInitStartEndTime = useRef<{start: Date | null, end: Date | null} | null>(null);

    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);

    const [showQrCode, setShowQrCode] = useState<boolean>(false);
    const {token, signInApp} = useToken();

    useEffect(() => {
        (async () => {
            if (alreadyInDb && routeId !== undefined) {
                if (!token) {
                    await signInApp();
                }

                const result = await getRouteInfo(routeId, token as string);

                if (!result.error) {
                    setRouteName(result.routeInfo.name);
                    setRouteCity(result.routeInfo.city);
                    setRouteDescription(result.routeInfo.description);
                    setStartTime(result.routeInfo.startAt);
                    setEndTime(result.routeInfo.endAt);
                    console.log('private', result.routeInfo.isPrivate, 'inOrder', result.routeInfo.inOrder);
                    refPrivateInorder.current = {isPrivate: result.routeInfo.isPrivate, isInOrder: result.routeInfo.inOrder}
                    refInitStartEndTime.current = {start: result.routeInfo.startAt, end: result.routeInfo.endAt}
                }
            }
        })();
    }, [alreadyInDb]);


    const validateName = (): boolean => {
        if (routeName.trim() === '') {
            setNameError('You need set a name')
            return false;
        } else if (routeName.trim().length < 3) {
            setNameError('The name is to short')
            return false;
        } else {
            setNameError(null)
        }

        return true;
    }

    const validateDescription = (): boolean => {
        if (routeDescription.trim() === '') {
            setDescriptionError('You need set a description')
            return false;
        } else {
            setDescriptionError(null)
        }

        return true;
    }

    const handleFinishPress = async () => {
        if (!validateName() || !validateDescription()) {
            return;
        }

        setIsLoading(true);

        let userId = await getPlayerId();
        if (userId < 0) {
            Alert.alert('Your app has not identify it self')
            return;
        }

        const result: SendData = {
            routeId: routeId === undefined ? -1 : Number(routeId),
            owner: userId,
            data: currentRoutes,
            name: routeName,
            city: routeCity,
            description: routeDescription,
            isPrivate: refPrivateInorder.current.isPrivate,
            inOrder: refPrivateInorder.current.isInOrder,
            startAt: startTime,
            endAt: endTime,
        };

        let url: string;
        if (alreadyInDb && routeId !== undefined) {
            url = '/api/edit/route';
        } else {
            url = '/api/add/routes';
        }

        if (!token) {
            await signInApp();
        }

        const response = await postJsonWithToken<SendData, ResponseData>(url, result, token as string);

        if (response.error) {
            Alert.alert('Something went wrong', response.error as string);
        } else {
            setQrCodeValue({name: routeName, routeId: response.routId});
            setShowNext(true);
        }
        setRouteCity('');
        setRouteDescription('');
        setRouteName('');

        onFinish();
        setIsLoading(false);
    }

    const copyToClipboard = async () => {
        if (qrCodeValue.routeId > -1) {
            await Clipboard.setStringAsync(qrCodeValue.name);
        }
    }

    const getCitys= () => {
        const result = currentRoutes.map(route => route.marker.city);
        const sorted = result.sort();
        if (sorted.length <= 0) sorted.push('Unknown');

        return [...new Set(sorted)];
    }

    const handeOnChangeCity = (citys: string[]) => {
        setRouteCity(citys.join(', '))
    }

    const handleNameChange = (text: string) => {
        setRouteName(text)
        validateName()
    }

    const handleDescriptionChange = (text: string) => {
        setRouteDescription(text)
        validateDescription()
    }

    const handlePrivateInOrderChanged = (ticks: any) => {
        refPrivateInorder.current = {isPrivate: ticks.isPrivate, isInOrder: ticks.isInOrder};
    }

    return (
        <View style={styles.container}>
            <ScrollView>
            <Loader loading={isLoading} />
            {!showNext ? (
                <>
                    <TextInput
                        placeholder={'Name the route'}
                        style={[styles.input, nameError && {borderColor: 'red'}]}
                        value={routeName}
                        onChangeText={handleNameChange}
                    />
                    <Text style={{color: "red"}}>{nameError}</Text>
                    <CityComponent
                        citys={getCitys()}
                        onChange={handeOnChangeCity}
                    />
                    <TextInput
                        placeholder={'Description'}
                        multiline={true}
                        style={[styles.textaria, descriptionError && {borderColor: 'red'}]}
                        value={routeDescription}
                        textAlignVertical={'top'}
                        onChangeText={handleDescriptionChange}
                    />
                    <Text style={{color: "red"}}>{descriptionError}</Text>
                    <SetStartAndEndTime
                        onStartDateChanged={setStartTime}
                        onEndDateChanged={setEndTime}
                        initialValue={refInitStartEndTime.current}
                    />
                    <AreRoutesPrivateAndInOrder
                        initialValue={refPrivateInorder.current}
                        inputChanged={handlePrivateInOrderChanged}
                    />
                    <ButtonsComponent.CancelAndFinishButtons
                        onFinish={handleFinishPress}
                        onCancel={onClose}
                        disabled={isLoading}
                    />
                </>
            ) : (
                <>
                    <Text>Your route is published!!!</Text>
                    <Spacer size={10}/>
                    <View style={styles.row}>
                        <Text style={{marginTop: 15}}>{qrCodeValue?.name} </Text>
                        <FontAwesome6.Button
                            name="copy"
                            backgroundColor={"transparent"}
                            size={32}
                            color="black"
                            onPress={async () => await copyToClipboard()}
                        />
                    </View>
                    <Spacer size={20}/>
                    <QrCodeModal
                        routeId={qrCodeValue.routeId}
                        name={qrCodeValue.name}
                        visible={showQrCode}
                        close={() => setShowQrCode(false)}
                        open={() => setShowQrCode(true)}
                        showButtonStyle={{
                            backgroundColor: '#2196F3',
                        }}
                    />
                    <Spacer size={20}/>

                    <TouchableOpacity
                        style={[styles.button]}
                        onPress={() => onClose()}
                    >
                        <Text style={styles.buttonTextStyle}>Close</Text>
                    </TouchableOpacity>
                </>
            )}
            </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
        padding: 10,
        zIndex: 1,
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
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        minWidth: 150,
    },
    buttonTextStyle: {
        backgroundColor: '#2196F3',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default SaveRouteOverlay