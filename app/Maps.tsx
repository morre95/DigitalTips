import React, {useState, useEffect, useRef, ComponentRef} from 'react';
import {StyleSheet, View, Text, Alert, Vibration, AppState, AppStateStatus} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import FontAwesome from '@expo/vector-icons/FontAwesome';

import Autocomplete from '@/components/Autocomplete';

import registerOrLogin, { globals } from "@/hooks/registerOrLogin";

import {router, useLocalSearchParams} from 'expo-router';

import {SearchResponse, getCheckpoints} from '@/hooks/api/Get'

import CheckPoint from '@/components/CheckPoint'

import FlashMessage from '@/components/FlashMessage'

import {Checkpoint, Question} from "@/interfaces/common";
import QuestionComponent from '@/components/create_route/QuestionComponent'
import PlayerNameSelect from '@/components/PlayerNameSelect'
import updatePlayerName from "@/functions/updatePlayerName";


type Region = {
    latitude: number
    latitudeDelta: number
    longitude: number
    longitudeDelta: number
}

type QuestionType = {
    question: Question;
    checkPointId: number;
}

// TODO: Ladda in den rutt som blivit sparad på routes sidan
export default function Maps() {
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const [showSearchButton, setShowSearchButton] = useState(true);

    const [score, setScore] = useState(0);
    const [question, setQuestion] = useState<QuestionType | null>(null);
    const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(0);

    const initialRegion: Region = {
        latitude: 58.317435384,
        longitude: 15.123921353,
        latitudeDelta: 0.0622,
        longitudeDelta: 0.0700,
    };

    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);

    const flashMessageRef = useRef<ComponentRef<typeof FlashMessage>>(null);

    const [showSelectPlayerName, setShowSelectPlayerName] = useState<boolean>(true);


    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    useEffect(() => {
        startFunction();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [appState]);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            startFunction();
        }
        setAppState(nextAppState);
    };

    const startFunction = () => {
        (async () => {
            await registerOrLogin();

            if (globals.JWT_token) {
                console.log('User id:', globals.userId, ', player:', globals.playerName);
                if (!globals.playerName) {
                    setShowSelectPlayerName(true);
                }
            } else {
                console.log('inte inloggad');
            }
        })();
    };


    const {routerData} = useLocalSearchParams();
    useEffect(() => {
        if (routerData) {
            const newRegion: Region = JSON.parse(routerData as string)
            setCurrentRegion(newRegion)
        }
    }, [routerData]);

    const [currenPosition, setCurrenPosition] = useState<{latitude: number, longitude: number}>()
    const handleMapPress = (event: any) => {
        if (!showSearchButton) {
            setShowSearchButton(true)
            return
        }

        const { coordinate } = event.nativeEvent;

        console.log(`Klickat på karten vid lat: ${coordinate.latitude}, lon: ${coordinate.longitude}`);
        setCurrenPosition({latitude: coordinate.latitude, longitude: coordinate.longitude})
    };

    const handleSearchPress = () => {
        setShowSearchButton(!showSearchButton);
    }

    const handelAutoOnSelect = async (item: SearchResponse) => {
        //console.log('Selected item:', item.name, ', id:', item.routeId)
        setShowSearchButton(true)
        setCheckpoints([]);
        type Markers = {
            checkpoints: Checkpoint[];
        }
        const markers = await getCheckpoints<Markers>(item.routeId)


        setCheckpoints(markers.checkpoints.map(checkpoint => {
            checkpoint.question.answers = [...checkpoint.question.answers].sort(() => Math.random() - 0.5);
            return checkpoint
        }));
    }

    const handleAnswerSelected = (isCorrect: boolean, id: number) => {
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);

            flashMessageRef.current?.success("Correct!", 5000);
        } else {
            flashMessageRef.current?.warning("Sorry but that is not the right answer...", 8000);
        }
        setQuestion(null)

        setCurrentCheckpointIndex(prevIndex => prevIndex + 1);

        const nextCheckpoints = checkpoints.map(checkpoint => {
            if (checkpoint.checkpoint_id === id) {
                return {
                    ...checkpoint,
                    isAnswered: true,
                };
            } else {
                return checkpoint;
            }
        });
        const isFinished =
            nextCheckpoints.filter(checkpoint => checkpoint.isAnswered).length === checkpoints.length;

        // TODO: Gör något med informationen att alla frågor är svarade
        if (isFinished) {
            // TBD: score här är inte uppdaterad än. Så denna sträng bör skapas på något annat vis. Tex. i setScore()
            console.log('Japp nu är det klar och ditt score är', score)
        } else {
            console.log('Next finished', nextCheckpoints.filter(checkpoint => checkpoint.isAnswered).length, ', checkpoints', checkpoints.length)
        }

        setCheckpoints(_ => nextCheckpoints)
    };

    const handlePlayerNameSelect = async (playerName: string) => {
        if (globals.userId) {
            const error = await updatePlayerName(globals.userId, playerName)
            if (error) {
                console.error('player name was not changed')
            }
            setShowSelectPlayerName(false);
        }
    }

    const handlePlayerNameCancel = async () => {
        setShowSelectPlayerName(false)
        if (!globals.playerName && globals.userId) {
            console.log('Inget namn var valt så', 'Player 1', 'blir det då')
            const error = await updatePlayerName(globals.userId, 'Player 1')
            if (error) {
                console.error('player name was not changed')
            }
        }
        setShowSelectPlayerName(false);
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={currentRegion}
                    onPress={handleMapPress}
                    onRegionChange={setCurrentRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    toolbarEnabled={false}
                    onLongPress={() => {
                        Alert.alert('Create new routes', 'Du you want to create new route?', [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Create new routes', 'Cancel Pressed'),
                                style: 'cancel',
                            },
                            {text: 'OK', onPress: () => router.navigate({
                                    pathname: "./CreateRoutes",
                                    params: { data : JSON.stringify(currentRegion) }
                                })},
                        ]);
                    }}
                >
                    {checkpoints.map((checkpoint, index) => (
                        <CheckPoint
                            key={checkpoint.checkpoint_id}
                            checkpoint={checkpoint}
                            onQuestion={(question: Question, id) => {
                                console.log('onQuestion:', checkpoint, 'id', id);
                                if (!checkpoint.isAnswered) {
                                    Vibration.vibrate([1000, 1000, 1000]) // vibrerar 1 sek tre gånger
                                    setQuestion({question: question, checkPointId: checkpoint.checkpoint_id});
                                }
                            }}
                            onChange={(distance: number) => {
                                flashMessageRef.current?.flash(`Distance changed, you are ${distance} meters from the checkpoint #${checkpoint.checkpoint_order}`, 10000);
                            }}
                            activeCheckpoint={currentCheckpointIndex === index}
                            onLeave={() => {
                                console.log('onLeave()', 'id:', checkpoint.checkpoint_id)
                                setQuestion(null)
                            }}
                            currentPosition={currenPosition}
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
                    <Autocomplete
                        onSelect={handelAutoOnSelect}
                        onSubmit={(item: string) => {
                            console.log('On Submit is item:', item)
                            setShowSearchButton(true)
                        }}
                    />
                ) }


                {question && <QuestionComponent
                    question={question.question}
                    onAnswerSelected={(isCorrect) => handleAnswerSelected(isCorrect, question.checkPointId)}
                />}

                <PlayerNameSelect
                    visible={showSelectPlayerName}
                    onSelect={handlePlayerNameSelect}
                    onCancel={handlePlayerNameCancel}
                />


                {score > 0 ? <Text>Score: {score}</Text> : null}

                <FlashMessage ref={flashMessageRef} />

            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeContainer: {
        flex: 1,
        padding: 24,
        backgroundColor: '#eaeaea',
    },
    map: {
        flex: 1,
    },
    markerStyle: {
        padding: 10,
        paddingRight: 15
    },
    tinyLogo: {
        width: 50,
        height: 50,
        marginBottom: 5,
    },
    search: {
        position: 'absolute',
        top: 2,
        left: 0,
        width: 65,
        height: 50,
        zIndex: 1100
    },

    newMarker: {
        position: 'absolute',
        top: 50,
        right: 0,
        width: 65,
        height: 50,
    },

    loadButton: {
        position: 'absolute',
        top: 100,
        right: 0,
        width: 65,
        height: 50,
    },

});
