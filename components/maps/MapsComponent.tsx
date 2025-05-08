import React, {useState, useRef, ComponentRef, useEffect} from 'react';
import {StyleSheet, View, Text, Vibration, Alert, Dimensions} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Region} from "react-native-maps";
import CheckPoint from "./CheckPoint";
import {Checkpoint, MarkersType, Question} from "@/interfaces/common";
import {useMapDispatch, useMapsState} from "./MapsContext";
import FlashMessage from "@/components/FlashMessage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Autocomplete from "./Autocomplete";
import {getCheckpoints, SearchResponse} from "@/functions/api/Get";
import AnswerQuestionComponent from "@/components/maps/AnswerQuestionComponent";
import Feather from "@expo/vector-icons/Feather";
import Menu, {MenuClickableItem, MenuLinkItem, MenuTextItem} from "@/components/maps/Menu";
import {useLocalSearchParams, useRouter} from 'expo-router';
import {getPlayerId} from "@/functions/common";
import {useToken} from "@/components/login/LoginContext";
import {useSQLiteContext} from "expo-sqlite";
import ScoreComponent from "@/components/maps/ScoreComponent";
import GoToCoordsComponent from "@/components/create_route/GoToCoordsComponent";
import {useLocation} from "@/hooks/LocationProvider";
import {getDistanceFast} from "@/functions/getDistance";


const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0722;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const initialRegion: Region = {
    latitude: 58.317435384,
    longitude: 15.123921353,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
};

type QuestionType = {
    question: Question;
    checkPointId: number;
};

const MapsComponent = () => {
    const router = useRouter();
    const state = useMapsState();
    const dispatch = useMapDispatch();
    const flashMessageRef = useRef<ComponentRef<typeof FlashMessage>>(null);
    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
    const [question, setQuestion] = useState<QuestionType | null>(null);
    const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(0);
    const [score, setScore] = useState(0);
    const [showSearchButton, setShowSearchButton] = useState(true);
    const [showNextCheckpoint, setShowNextCheckpoint] = useState(false);
    const [newRegion, setNewRegion] = useState<Region|undefined>();
    const initRouteInfo = {gameName: '', isAdmin: false, routeId: -1, inOrder: false, isPrivate: false}
    const currentRouteInfoRef =
        useRef<{gameName: string, isAdmin: boolean, routeId: number, inOrder: boolean, isPrivate: boolean}>(initRouteInfo);
    const {routeId} = useLocalSearchParams<{routeId: string}>();
    const {token, signInApp} = useToken();
    const mapRef = useRef<MapView | null>(null);
    const {userLocation} = useLocation();

    const db = useSQLiteContext();

    const updateClosestCheckpoint = (location: {
        latitude: number;
        longitude: number;
    }) => {
        let closest = Number.MAX_SAFE_INTEGER;
        let closestIndex = 0;
        const updatedCheckpoints: Checkpoint[] = [];
        for (let i = 0; i < state.checkpoints.length; i++) {
            const checkpoint = state.checkpoints[i];
            const distance = getDistanceFast(location, {
                latitude: Number(checkpoint.latitude),
                longitude: Number(checkpoint.longitude)
            });

            if (i === 0 || distance < closest) {
                closest = distance;
                closestIndex = i;
            }

            checkpoint.closest = false;
            updatedCheckpoints.push(checkpoint);
        }

        updatedCheckpoints[closestIndex].closest = true;
        dispatch(() => updatedCheckpoints);
    }

    useEffect(() => {
        if (userLocation && state.checkpoints.length > 0) {
            updateClosestCheckpoint(userLocation.coords);
        }
    }, [userLocation]);

    useEffect(() => {
        const id = Number(routeId);
        if (id > 0) {
            (async () => {

                if (!token) {
                    await signInApp();
                }
                const markers = await getCheckpoints<MarkersType>(id, token as string);

                const playerId = await getPlayerId();
                if (markers.checkpoints.length > 0) {
                    const isAdmin = Number(markers.owner) === playerId;
                    currentRouteInfoRef.current = {
                        gameName: markers.gameName,
                        isAdmin: isAdmin,
                        routeId: markers.routeId,
                        inOrder: markers.inOrder,
                        isPrivate: markers.isPrivate,
                    }
                } else {
                    currentRouteInfoRef.current = initRouteInfo
                }

                dispatch(() => markers.checkpoints);
            })();
        }
    }, [routeId]);


    const [testLocation, setTestLocation] = useState<{
        latitude: number
        longitude: number
    } | null>(null);
    const handleMapPress = (event: any) => {
        setShowSearchButton(true);

        // TBD: Test kode som behövs för att kunna test köra frågedelen i emulatorn
        if (state.checkpoints.length > 0) {
            const {coordinate} = event.nativeEvent;
            setTestLocation({longitude: coordinate.longitude, latitude: coordinate.latitude});
            updateClosestCheckpoint({longitude: coordinate.longitude, latitude: coordinate.latitude});
        }
    }

    const handleSearchPress = () => {
        //setShowSearchButton(!showSearchButton);
        setShowSearchButton(false);
    }

    const DispatchCheckpoints = async (routeId: number) => {
        if (!token) {
            await signInApp();
        }

        const markers = await getCheckpoints<MarkersType>(routeId, token as string);

        if (markers.checkpoints.length > 0) {
            const playerId = await getPlayerId();
            const isAdmin = Number(markers.owner) === playerId;
            currentRouteInfoRef.current = {
                gameName: markers.gameName,
                isAdmin: isAdmin,
                routeId: markers.routeId,
                inOrder: markers.inOrder,
                isPrivate: markers.isPrivate,
            }
        } else {
            currentRouteInfoRef.current = initRouteInfo
        }

        type RouteProgress = {
            checkpoint_id: number;
            question_id: number;
            answered_correctly: boolean;
        }
        const progress = await db.getAllAsync<RouteProgress>(
            'SELECT * FROM route_progress WHERE route_id = ?', currentRouteInfoRef.current.routeId
        );
        if (progress.length > 0) {
            Alert.alert(
                'You have been here before',
                'Do you want to continue where you left off?',
                [
                    {
                        text: 'Yes',
                        onPress: () => {
                            const newCheckpoints = markers.checkpoints.map(checkpoint => {
                                for (let i = 0; i < progress.length; i++) {
                                    if (checkpoint.question_id == progress[i].question_id) {
                                        checkpoint.isAnswered = true;
                                        setCurrentCheckpointIndex(prevIndex => prevIndex + 1);

                                        if (progress[i].answered_correctly) {
                                            setScore(prevScore => prevScore + 1);
                                        }
                                    }
                                }

                                return checkpoint;
                            });
                            dispatch(() => newCheckpoints);
                        }
                    }, {
                    text: 'Go to start',
                    onPress: async () => {
                        await handleRemoveGame();
                        dispatch(() => markers.checkpoints);
                    },
                    style: 'cancel'
                }
                ]
            )
        } else {
            await handleRemoveGame();
            dispatch(() => markers.checkpoints);
        }

        if (markers.checkpoints.length > 0) {
            const region = {
                latitude: Number(markers.checkpoints[0].latitude),
                longitude: Number(markers.checkpoints[0].longitude)
            };
            moveToRegion(region);
        }
    }

    const handleAutoOnSelect = async (item: SearchResponse) => {
        setShowSearchButton(true);

        await DispatchCheckpoints(item.routeId);
    }


    const moveToRegion = (latLon : {latitude: number, longitude: number})  => {
        const newRegion: Region = {
            latitude: latLon.latitude,
            longitude: latLon.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
        };

        setNewRegion(newRegion);
    }

    const handleAutoOnSubmit = (item: string) => {
        setShowSearchButton(true)
        router.push( './search/[details}');
        router.setParams({ details: item })
    }

    const saveScore = async (isCorrect: boolean, questionId: number, checkpointId: number) => {
        const statement = await db.prepareAsync(
            `INSERT INTO route_progress(route_id, checkpoint_id, question_id, answered_correctly) 
                    VALUES ($route_id, $checkpoint_id, $question_id, $answered_correctly)`);

        try {
            await statement.executeAsync(
                {
                    $route_id: currentRouteInfoRef.current.routeId,
                    $checkpoint_id: checkpointId,
                    $question_id: questionId,
                    $answered_correctly: isCorrect ? 1 : 0
                });
        } catch (e) {
            console.error((e as Error).message);
        } finally {
            await statement.finalizeAsync();
        }
    }

    const handleAnswerSelected = async (isCorrect: boolean, questionId: number, checkpointId: number) => {
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);

            flashMessageRef.current?.success("Correct!", 5000);
        } else {
            flashMessageRef.current?.warning("Sorry but that is not the right answer...", 8000);
        }

        setQuestion(null);


        const nextCheckpoints = state.checkpoints.map(checkpoint => {
            if (checkpoint.checkpoint_id === checkpointId) {
                return {
                    ...checkpoint,
                    isAnswered: true,
                };
            } else {
                return checkpoint;
            }
        });

        const isFinished =
            nextCheckpoints.filter(checkpoint => checkpoint.isAnswered).length === state.checkpoints.length;

        /*const result = await db.getAllAsync("SELECT * FROM route_progress");
        for (const item of result) {
            console.log(item)
        }
        const result2 = await db.getAllAsync(
            `SELECT 
                    (SELECT COUNT(answered_correctly) FROM route_progress WHERE answered_correctly = 1) AS correct, 
                    COUNT(*) AS totalAnswered, 
                    route_id AS routeId, 
                    checkpoint_id as checkpointId 
                    FROM route_progress`
        );
        for (const item of result2) {
            console.log(item)
        }*/

        await saveScore(isCorrect, questionId, checkpointId);

        setCurrentCheckpointIndex((prevIndex: number) => {
            const newState = prevIndex + 1

            if (currentRouteInfoRef.current.inOrder && showNextCheckpoint) {
                moveCameraToCheckpoint(newState);
            }

            return newState
        });

        if (isFinished) {
            //await handleRemoveGame();
            /*const ch = nextCheckpoints[state.checkpoints.length - 1];
            console.log('#', ch.checkpoint_id, 'is answered:', ch.isAnswered);*/
        }

        dispatch(() => nextCheckpoints);

    };

    const moveCameraToCheckpoint = (index: number = currentCheckpointIndex): void => {
        const checkpoint = state.checkpoints[index];
        const region = {
            latitude: Number(checkpoint.latitude),
            longitude: Number(checkpoint.longitude),
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
        };

        if (region) {
            mapRef.current?.animateToRegion(region, 1000);
        }
    }

    const handleNextCheckpoint = () => {
        setShowNextCheckpoint(prevState => {
            if (!prevState) {
                moveCameraToCheckpoint();
            }
            return !prevState;
        });
    }

    const handleResetGame = () => {
        async function reset() {
            const checkpoints = state.checkpoints.map(checkpoint => {
                if (checkpoint.isAnswered) {
                    checkpoint.isAnswered = false;
                }
                return checkpoint
            });
            await handleRemoveGame();

            dispatch(() => checkpoints);
        }

        Alert.alert(
            'Reset the game',
            'Do you really want to restart the game? \nAnd delete all your progress?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: async () => await reset()
                },
            ]
        );

    }

    const handleQrReader = () => {
        router.replace('./QrCodeReader');
    }

    const handleRemoveGame = async () => {
        setScore(0);
        setCurrentCheckpointIndex(0);
        await db.execAsync('DELETE FROM route_progress;');
        dispatch(() => []);
    }

    const handleOnRegionChange = (currentRegion: Region) => {
        if (newRegion !== undefined) {
            setNewRegion(undefined);
        }
        setCurrentRegion(currentRegion);
    }

    const handleOnQuestion = (checkpoint: Checkpoint) => {
        if (!checkpoint.isAnswered) {
            setQuestion(null); // Test, maybe not needed...
            Vibration.vibrate([1000, 1000, 1000]) // vibrerar 1 sek tre gånger

            setQuestion({question: checkpoint.question, checkPointId: checkpoint.checkpoint_id});
        } else {
            console.log(checkpoint.question.text, 'is already answered');
        }
    }

    const handleOnFocusChange = (isFokus: boolean) => {
        setShowSearchButton(!isFokus);
    }


    return (
        <View style={styles.container}>
            <FlashMessage ref={flashMessageRef} />

            <MapView
                ref={map => mapRef.current = map}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={currentRegion}
                region={newRegion}
                onPress={handleMapPress}
                onRegionChange={handleOnRegionChange}
                showsUserLocation={true}
                showsMyLocationButton={false}
                toolbarEnabled={false}
            >
                {state.checkpoints.map((checkpoint, index) => (
                    <CheckPoint
                        key={checkpoint.checkpoint_id}
                        checkpoint={checkpoint}
                        onQuestion={() => handleOnQuestion(checkpoint)}
                        onChange={(distance: number) => {
                            if (checkpoint.closest) {
                                flashMessageRef.current?.flash(`Distance changed, you are ${distance} meters from the checkpoint #${checkpoint.checkpoint_order}`, 10000);
                            }
                        }}
                        activeCheckpoint={currentCheckpointIndex === index}
                        showNextCheckpoint={(currentCheckpointIndex === index || !currentRouteInfoRef.current.inOrder) && showNextCheckpoint}
                        onLeave={() => {
                            console.log('onLeave()', 'id:', checkpoint.checkpoint_id, 'order:', checkpoint.checkpoint_order);
                            setQuestion(null);
                        }}
                        onEnter={() => {
                            console.log('onEnter()', 'id:', checkpoint.checkpoint_id, 'order:', checkpoint.checkpoint_order);
                            //setQuestion({question: checkpoint.question, checkPointId: checkpoint.checkpoint_id, questionId: checkpoint.question.questionId});
                        }}
                        inOrder={currentRouteInfoRef.current.inOrder}

                        testLocation={testLocation ? testLocation: undefined}
                    />
                ))}
            </MapView>
            {showSearchButton ? (
                <View style={styles.search}>
                    <FontAwesome.Button
                        name="search"
                        size={35}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={handleSearchPress} />
                </View>
            ) : (
                <View style={styles.autoCompleteContainer}>
                    <Autocomplete
                        onSelect={handleAutoOnSelect}
                        onSubmit={handleAutoOnSubmit}
                        onFokusChanged={handleOnFocusChange}
                    />
                </View>
            ) }

            {question && <AnswerQuestionComponent
                question={question.question}
                onAnswerSelected={async (isCorrect, questionId) => {
                    await handleAnswerSelected(isCorrect, questionId, question.checkPointId)
                }}
            />}

            <ScoreComponent
                visible={score > 0}
                score={score}
                routeId={currentRouteInfoRef.current.routeId}
                questionAnswered={state.checkpoints.filter(obj => obj.isAnswered).length}
                totalQuestions={state.checkpoints.length}
            />

            {state.checkpoints.length > 0 && (
                <Text>"{currentRouteInfoRef.current.gameName}" is running. {currentRouteInfoRef.current.isAdmin && 'Click menu to edit'}</Text>
            )}

            <Menu trigger={<Feather name="menu" size={44} color="black" />} bottomRight={true}>
                <MenuTextItem text={showNextCheckpoint ? 'Show Checkpoints Flags only':'Next Checkpoint'} onPress={handleNextCheckpoint} />
                <MenuTextItem text={'Restart the game'} onPress={handleResetGame} />
                <MenuTextItem text={'Remove game'} onPress={handleRemoveGame} />
                <MenuTextItem text={'Qr Code Reader'} onPress={handleQrReader} />
                <MenuClickableItem onPress={() => null} >
                    <GoToCoordsComponent
                        onCoordsFound={(coords) => {
                            const region: Region = {
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA
                            }
                            mapRef.current?.animateToRegion(region, 1000);
                        }}
                    />
                </MenuClickableItem>
                {currentRouteInfoRef.current.isAdmin && <MenuLinkItem
                    href={{
                        pathname: '/CreateRoutes',
                        params: {routeId: currentRouteInfoRef.current.routeId.toString()}
                    }}
                    text={'Edit Route'}
                />}
            </Menu>



        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    search: {
        position: 'absolute',
        top: 2,
        left: 0,
        width: 65,
        height: 50,
    },
    autoCompleteContainer: {
        position: 'absolute',
        top: 2,
        left: 0,
        width: '95%',
        zIndex: 1100
    },
    linkButton: {
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: '#0569FF',
        borderColor: '#0569FF',

        /*Shadow*/
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 2, width: 1 }, // IOS
        shadowOpacity: 2, // IOS
        shadowRadius: 2, //IOS
        elevation: 4, // Android

        textAlign: 'center',
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#fff',
    },
})

export default MapsComponent