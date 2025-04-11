import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import React, {useEffect, useRef, useState} from "react";
import {Alert, StyleSheet, Text, View, Dimensions} from "react-native";
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Answer, Checkpoint, MarkerData, RouteData} from "@/interfaces/common";
import {getCity} from "@/functions/request";
import {useCreateDispatch} from "@/components/create_route/CreateContext";
import CircleMarker from "@/components/create_route/CircleMarker";
import AddQuestion from "@/components/create_route/AddQuestion";
import {ButtonsComponent} from "@/components/create_route/ButtonsComponent";
import NextRoutesOverlay from "@/components/create_route/saving_routes/NextRoutesOverlay";
import AddQuestionFromDb from "@/components/create_route/AddQuestionFromDb";
import RandomCheckPoints from "@/components/create_route/RandomCheckpoints";
import HelpPopup from "@/components/create_route/HelpPopup";
import Loader from "@/components/Loader";
import {deleteCheckpoint, getCheckpoints} from "@/functions/api/Get";
import Feather from "@expo/vector-icons/Feather";
import Menu, {MenuItemWithChildren, MenuTextItem} from "@/components/maps/Menu";
import {useToken} from '@/components/login/LoginContext'

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0550;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const initialRegion: Region = {
    latitude: 58.317435384,
    longitude: 15.123921353,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
};

export function CreateMapComponent() {
    const {state, dispatch} = useCreateDispatch();
    const markerRef = useRef<RouteData | null>(null);
    const [showAddQuestion, setShowAddQuestion] = useState<boolean>(false);
    const [showNext, setShowNext] = useState<boolean>(false);
    const [showDbQuestionSelect, setShowDbQuestionSelect] = useState<boolean>(false);
    const [showGenerateRandomCheckpoints, setShowGenerateRandomCheckpoints] = useState<boolean>(false);
    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
    const [showHelpPopup, setShowHelpPopup] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const {routeId} = useLocalSearchParams()
    const router = useRouter();
    const {token, signInApp} = useToken();

    useEffect(() => {
        if (!token) signInApp();
    }, [token]);

    useEffect(() => {
        const id = Number(routeId);
        if (id > 0) {

            (async () => {
                type Markers = {
                    checkpoints: Checkpoint[];
                }

                const markers = await getCheckpoints<Markers>(id)

                const checkpoints = markers.checkpoints.map(checkpoint => {
                    checkpoint.question.answers = [...checkpoint.question.answers].sort(() => Math.random() - 0.5);
                    return checkpoint;
                });

                for (let i = 0; i < checkpoints.length; i++) {

                    const marker : RouteData = {
                        marker: {
                            id: checkpoints[i].checkpoint_id,
                            latitude: Number(checkpoints[i].latitude),
                            longitude: Number(checkpoints[i].longitude),
                            name: `Checkpoint ${checkpoints[i].checkpoint_order}`,
                            markerOrder: checkpoints[i].checkpoint_order,
                            city: checkpoints[i].city,
                        },
                        question: checkpoints[i].question.text,
                        questionId: checkpoints[i].question_id,
                        answers: checkpoints[i].question.answers
                    };

                    dispatch({type: 'add', checkpoint: { marker: marker.marker }})
                    dispatch({type: 'addQuestion', checkpoint: {
                            marker: marker.marker,
                            question: marker.question,
                            answers: marker.answers
                        }});
                }
            })();
        }
    }, [routeId]);

    const handleMapPress = async (event: any) => {
        setLoading(true);
        const { coordinate } = event.nativeEvent

        const city = await getCity({latitude: coordinate.latitude, longitude: coordinate.longitude})

        const len = state.checkpoints.length
        const newMarker: MarkerData = {
            id: len + 1,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            name: `Marker ${len + 1}`,
            markerOrder: len + 1,
            city: city ?? ''
        }

        dispatch({type: 'add', checkpoint: { marker: newMarker }})
        addQuestion({ marker: newMarker })
    }

    const addQuestion = (marker: RouteData) => {
        setShowAddQuestion(true)
        markerRef.current = marker
        setLoading(false);
    }

    const handelDrag = async (event: any, route: RouteData) => {
        const { coordinate } = event.nativeEvent;
        route.marker.latitude = coordinate.latitude;
        route.marker.longitude = coordinate.longitude;

        const city = await getCity({latitude: coordinate.latitude, longitude: coordinate.longitude})
        route.marker.city = city ?? 'Unknown'
        console.log(city, 'är det som gäller nu')

        dispatch({type: 'moveCheckpoint', checkpoint: route});
    }

    const handleSaveQuestion = (question: string, answers: Answer[], order: number) => {
        setShowAddQuestion(false)
        const marker = markerRef.current
        if (marker) {
            dispatch({type: 'addQuestion', checkpoint: {
                marker: marker.marker,
                question: question,
                answers: answers
            }});

            marker.marker.markerOrder = order
            dispatch({type: 'changeOrder', checkpoint: {
                    marker: marker.marker
            }})
        }
        markerRef.current = null
    }

    const handelCancelAddQuestion = () => {
        setShowAddQuestion(false)
        const marker = markerRef.current
        if (marker && !marker.question) {
            dispatch({type: 'delete', checkpoint: marker})
        }
        markerRef.current = null
    }

    const handeDeleteCheckpoint = () => {
        setShowAddQuestion(false)
        const marker = markerRef.current
        if (marker) {
            dispatch({type: 'delete', checkpoint: marker})
        }
        markerRef.current = null
    }

    const handleContinue = () => {
        setShowNext(true);
    }

    const handleDeleteAll = async () => {
        dispatch({type: 'deleteAll'})
        const id = Number(routeId)
        if (token && id > 0) {
            async function deleteApiCheckpoints(JWT_token: string): Promise<void> {
                await deleteCheckpoint(id, JWT_token)
                router.setParams({});
            }

            Alert.alert(
                'Permanent delete checkpoints',
                'Du you want to delete this route permanently',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Yes delete',
                        onPress: () => deleteApiCheckpoints(token)
                    }
                ]
            )
        }
    }

    const handleNextCancel = () => {
        Alert.alert(
            'Delete checkpoints',
            'Du you really want to delete all checkpoints?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('handleDeleteAllMarkers()', 'Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes', onPress: async () => {
                        await handleDeleteAll();
                    }
                },
            ]);
    }

    const handelAddQuestionFromDB = (question: any) => {
        setShowDbQuestionSelect(false)
        setShowAddQuestion(true)

        let answers: Answer[] = []
        let newAnswers: Answer = {
            id: answers.length + 1,
            text: question.correct_answer,
            isCorrect: true,
        }
        answers.push(newAnswers)
        for (let incorrect of question.incorrect_answers) {
            newAnswers = {
                id: answers.length + 1,
                text: incorrect,
                isCorrect: false,
            }
            answers.push(newAnswers)
        }

        const order = markerRef?.current?.marker.markerOrder || 0

        handleSaveQuestion(question.question, answers, order)
    }

    const generateRandomCheckpoints = () => {
        setShowGenerateRandomCheckpoints(true)
    }

    const handleRandomFinished = (checkpoints: RouteData[]) => {
        setShowGenerateRandomCheckpoints(false)

        if (checkpoints.length <= 0) {
            return
        }

        const startOrder = state.checkpoints.length

        for (let i = 0; i < checkpoints.length; i++) {
            let checkpoint = checkpoints[i];
            if (startOrder > 0) {
                checkpoint.marker.id += startOrder
                checkpoint.marker.markerOrder += startOrder
            }
            dispatch({type: 'add', checkpoint: checkpoint })
        }
    }

    const handleHelp = () => {
        setShowHelpPopup(true)
    }

    return (
        <View style={styles.map}>
            {state.checkpoints.length > 0 ? <ButtonsComponent.CancelAndContinueButtons
                onContinue={handleContinue}
                onCancel={handleNextCancel}
            />: null}
            <MapView
                provider={PROVIDER_GOOGLE}
                region={initialRegion}
                style={styles.map}
                onPress={handleMapPress}
                onRegionChange={setCurrentRegion}
                showsMyLocationButton={false}
                toolbarEnabled={false}
            >
                {state.checkpoints.map(
                    (route, index) => (
                        <Marker
                            key={index}
                            coordinate={{latitude: route.marker.latitude, longitude: route.marker.longitude}}
                            draggable
                            onDragEnd={(event) => handelDrag(event, route)}
                            onPress={() => {
                                addQuestion(route);
                            }}
                        >
                            <CircleMarker
                                order={route.marker.markerOrder}
                            />
                        </Marker>
                    )
                )}
            </MapView>

            <Menu trigger={<Feather name="menu" size={44} color="black" />} bottomRight>
                <MenuTextItem text={'Help'} onPress={handleHelp} />
                <MenuTextItem text={'Generate random Checkpoints'} onPress={generateRandomCheckpoints} />
                <MenuItemWithChildren onPress={() => console.log('Meny item med text länk')}>
                    <Text style={{fontSize: 24, fontWeight: 900, fontStyle: 'italic', borderBottomWidth: 1, }}>En text länk</Text>
                </MenuItemWithChildren>
                <MenuItemWithChildren onPress={() => console.log('Meny med barn')}>
                    <View style={{ alignItems: 'center',
                        padding: 10,
                        marginVertical: 5,
                        borderRadius: 15,
                        borderWidth: 5,
                        backgroundColor: '#c105ff',
                        borderColor: '#ff8000', }}>
                        <Text style={{color: '#000', fontSize: 24, fontWeight: 900, fontStyle: 'italic'}}>Test med barn</Text>
                    </View>
                </MenuItemWithChildren>
            </Menu>

            <AddQuestion
                visible={showAddQuestion}
                onCancel={handelCancelAddQuestion}
                onSave={handleSaveQuestion}
                currentCheckpoint={markerRef.current}
                numberOfCheckpoints={state.checkpoints.length}
                onDelete={handeDeleteCheckpoint}
                onAddQuestionFromDb={() => {
                    setShowDbQuestionSelect(true);
                    setShowAddQuestion(false);
                }}
            />

            {showNext &&
                <NextRoutesOverlay
                    currentRoutes={state.checkpoints}
                    onFinish={() => dispatch({type: 'deleteAll'})}
                    onClose={() => {
                        setShowNext(false);
                        if (Number(routeId) > 0) router.setParams({})
                    }}
                    alreadyInDb={Number(routeId) > 0}
                    routeId={Number(routeId) > 0 ? Number(routeId) : undefined}
                />
            }

            {showDbQuestionSelect &&
                <AddQuestionFromDb
                    onSelectedQuestion={handelAddQuestionFromDB}
                />
            }

            <HelpPopup
                visible={showHelpPopup}
                onClose={() => setShowHelpPopup(false)}
            />

            <RandomCheckPoints
                isVisible={showGenerateRandomCheckpoints}
                onFinish={handleRandomFinished}
                currentCoordinate={{ latitude: currentRegion.latitude, longitude: currentRegion.longitude }}
            />


            <Loader loading={loading} />
            {/*<Text>{token?.slice(-15)}</Text>*/}
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },

})