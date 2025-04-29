import React, {useState, useRef, ComponentRef, useEffect} from 'react';
import {StyleSheet, View, Text, Vibration, Alert, Dimensions} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Region} from "react-native-maps";
import CheckPoint from "./CheckPoint";
import {Checkpoint, Question} from "@/interfaces/common";
import {useMapDispatch, useMapsState} from "./MapsContext";
import FlashMessage from "@/components/FlashMessage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Autocomplete from "./Autocomplete";
import {getCheckpoints, SearchResponse} from "@/functions/api/Get";
import AnswerQuestionComponent from "@/components/maps/AnswerQuestionComponent";
import Feather from "@expo/vector-icons/Feather";
import Menu, {MenuTextItem} from "@/components/maps/Menu";
import {useLocalSearchParams, useRouter} from 'expo-router';
import {getPlayerId} from "@/functions/common";
import {useToken} from "@/components/login/LoginContext";
import {useSQLiteContext} from "expo-sqlite";
import RefPopup from "@/components/popup/RefPopup";
import FinishPopup from "@/components/popup/FinishPopup";

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
    questionId: number;
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
    const [currentPos, setCurrentPos] = useState<{longitude: number, latitude: number}>({longitude: 0, latitude: 0});
    const [newRegion, setNewRegion] = useState<Region|undefined>();
    const [gameName, setGameName] = useState<string | null>(null);
    const {routeId} = useLocalSearchParams<{routeId: string}>();
    const {token, signInApp} = useToken();

    const db = useSQLiteContext();

    useEffect(() => {
        const id = Number(routeId);
        if (id > 0) {
            (async () => {
                type Markers = {
                    checkpoints: Checkpoint[];
                    gameName?: string;
                }
                if (!token) {
                    await signInApp();
                }
                const markers = await getCheckpoints<Markers>(id, token as string);

                if (markers.gameName) setGameName(markers.gameName);

                dispatch(() => markers.checkpoints);
            })();
        }
    }, [routeId]);


    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        setCurrentPos(coordinate);

        setShowSearchButton(true);
    }

    const handleSearchPress = () => {
        //setShowSearchButton(!showSearchButton);
        setShowSearchButton(false);
    }

    const DispatchCheckpoints = async (routeId: number) => {
        type Markers = {
            checkpoints: Checkpoint[];
            gameName?: string;
        }

        if (!token) {
            await signInApp();
        }

        const markers = await getCheckpoints<Markers>(routeId, token as string);

        if (markers.gameName) setGameName(markers.gameName);

        type RouteProgress = {
            checkpoint_id: number;
            question_id: number;
            answered_correctly: boolean;
        }
        const progress = await db.getAllAsync<RouteProgress>(
            'SELECT * FROM route_progress WHERE route_id = ?', markers.checkpoints[0].route_id
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
                        dispatch(() => markers.checkpoints);
                        await db.execAsync('DELETE FROM route_progress;');
                        setScore(0);
                        setCurrentCheckpointIndex(0);
                    },
                    style: 'cancel'
                }
                ]
            )
        } else {
            await db.execAsync('DELETE FROM route_progress;');
            dispatch(() => markers.checkpoints);
            setScore(0);
            setCurrentCheckpointIndex(0);
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

        const playerId = await getPlayerId();
        const isAdmin = Number(item.owner) === playerId;
        console.log(item, isAdmin, playerId);
        if (isAdmin) {
            Alert.alert(
                'You are admin',
                'Do you want to start or edit', [
                {
                    text: 'Start Game',
                    onPress: async () => await DispatchCheckpoints(item.routeId),
                },
                {
                    text: 'Cancel',
                    //onPress: () => { isEdit = true; },
                    style: 'cancel',
                },
                {text: 'Edit', onPress: () => {
                        router.replace({pathname: './CreateRoutes', params: {routeId: item.routeId}})
                    }},
            ])
        } else {
            await DispatchCheckpoints(item.routeId);
        }
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

    const handleAnswerSelected = async (isCorrect: boolean, questionId: number, checkpointId: number) => {
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);

            flashMessageRef.current?.success("Correct!", 5000);
        } else {
            flashMessageRef.current?.warning("Sorry but that is not the right answer...", 8000);
        }
        setQuestion(null)

        setCurrentCheckpointIndex(prevIndex => prevIndex + 1);

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

        if (isFinished) {
            await db.execAsync('DELETE FROM route_progress;');
            let myScore;
            setScore(prevScore => myScore = prevScore);

            FinishPopup.show(
                'Finished...',
                `Congratulations!!! You have finished the route with score: ${myScore}/${state.checkpoints.length}`
            );

            dispatch(()=>[]);
            setScore(0);
            setCurrentCheckpointIndex(0);

            /*Alert.alert(
                'Finished...',
                `Congratulations!!! You have finished the route with score: ${myScore}/${state.checkpoints.length}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            dispatch(() => []);
                            setScore(0);
                            setCurrentCheckpointIndex(0);
                        }
                    },
                ]
            );*/

            return
        } else {
            const routeId = nextCheckpoints[0].route_id;

            const statement = await db.prepareAsync(
                `INSERT INTO route_progress(route_id, checkpoint_id, question_id, answered_correctly) 
                                    VALUES ($route_id, $checkpoint_id, $question_id, $answered_correctly)`);

            try {
                await statement.executeAsync(
                    {
                        $route_id: routeId,
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

        dispatch(() => nextCheckpoints);
    };

    const handleNextCheckpoint = () => {
        setShowNextCheckpoint(!showNextCheckpoint);
    }

    const handleResetGame = () => {
        function reset() {
            const checkpoints = state.checkpoints.map(checkpoint => {
                if (checkpoint.isAnswered) {
                    checkpoint.isAnswered = false;
                }
                return checkpoint
            });
            dispatch(() => checkpoints);

            setScore(0);
            setCurrentCheckpointIndex(0);
        }

        Alert.alert(
            'Reset the game',
            'Do you really want to rest the game?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: () =>
                        reset()
                },
            ]
        );

    }

    const handleRestartGame = () => {
        console.log('Restart Game!!!', 'Not implemented yet!!!');
    }

    const handleQrReader = () => {
        router.replace('./QrCodeReader');
    }

    const handleRemoveGame = () => {
        dispatch(() => []);
    }

    const handleOnRegionChange = (currentRegion: Region) => {
        if (newRegion !== undefined) {
            setNewRegion(undefined);
        }
        setCurrentRegion(currentRegion);
    }

    const handleOnQuestion = (question: Question, checkpointId: number, isAnswered: boolean | undefined) => {
        if (!isAnswered) {
            Vibration.vibrate([1000, 1000, 1000]) // vibrerar 1 sek tre gånger
            setQuestion({question: question, checkPointId: checkpointId, questionId: question.questionId});
        } else {
            console.log(question.text, 'is already answered');
        }
    }

    const handleOnFocusChange = (isFokus: boolean) => {
        setShowSearchButton(!isFokus);
    }


    return (
        <View style={styles.container}>
            <FlashMessage ref={flashMessageRef} />

            <MapView
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
                        onQuestion={handleOnQuestion}
                        onChange={(distance: number) => {
                            flashMessageRef.current?.flash(`Distance changed, you are ${distance} meters from the checkpoint #${checkpoint.checkpoint_order}`, 10000);
                        }}
                        activeCheckpoint={currentCheckpointIndex === index}
                        showNextCheckpoint={currentCheckpointIndex === index && showNextCheckpoint}
                        onLeave={() => {
                            console.log('onLeave()', 'id:', checkpoint.checkpoint_id);
                            setQuestion(null);
                        }}
                        onEnter={() => {
                            console.log('onEnter()', 'id:', checkpoint.checkpoint_id);
                        }}

                        // TBD: Bara för testning
                        currentPosition={currentPos}
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

            {score > 0 && <Text>{score}/{state.checkpoints.filter(obj => obj.isAnswered).length}</Text>}
            {state.checkpoints.length > 0 && (
                <Text>"{gameName}" is running</Text>
            )}

            <Menu trigger={<Feather name="menu" size={44} color="black" />} bottomRight>
                <MenuTextItem text={showNextCheckpoint ? 'Show Checkpoints Flags only':'Next Checkpoint'} onPress={handleNextCheckpoint} />
                <MenuTextItem text={'Reset the game'} onPress={handleResetGame} />
                <MenuTextItem text={'Restart the game'} onPress={handleRestartGame} />
                <MenuTextItem text={'Remove game'} onPress={handleRemoveGame} />
                <MenuTextItem text={'Qr Code Reader'} onPress={handleQrReader} />
            </Menu>

            <RefPopup
                onClose={() => {
                    FinishPopup.hide();
                }}
            />

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
})

export default MapsComponent