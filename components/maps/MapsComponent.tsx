import React, {useState, useRef, ComponentRef, useEffect} from 'react';
import {StyleSheet, View, Vibration, Alert} from 'react-native';
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

const initialRegion: Region = {
    latitude: 58.317435384,
    longitude: 15.123921353,
    latitudeDelta: 0.0622,
    longitudeDelta: 0.0700,
};
type QuestionType = {
    question: Question;
    checkPointId: number;
}

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
    const {routeId} = useLocalSearchParams();

    useEffect(() => {
        const id = Number(routeId);
        if (id > 0) {
            (async () => {
                type Markers = {
                    checkpoints: Checkpoint[];
                }
                const markers = await getCheckpoints<Markers>(id)

                dispatch(() => markers.checkpoints);
            })();
        }
    }, [routeId]);

    // TBD: bara för testning
    const [currenPos, setCurrenPos] = useState<{longitude: number, latitude: number}>({longitude: 0, latitude: 0});
    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        console.log(coordinate);
        setCurrenPos(coordinate);

        setShowSearchButton(true);
    }

    const handleSearchPress = () => {
        setShowSearchButton(!showSearchButton);
    }

    const handleAutoOnSelect = async (item: SearchResponse) => {
        const DispatchCheckpoints = async (routeId: number) => {
            type Markers = {
                checkpoints: Checkpoint[];
            }
            const markers = await getCheckpoints<Markers>(routeId)
            dispatch(() => markers.checkpoints);
        }

        setShowSearchButton(true)
        const playerId = await getPlayerId()
        const isAdmin = Number(item.owner) === playerId
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

    const handleAutoOnSubmit = (item: string) => {
        setShowSearchButton(true)
        router.push( './search/[details}');
        router.setParams({ details: item })
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

        const nextCheckpoints = state.checkpoints.map(checkpoint => {
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
            nextCheckpoints.filter(checkpoint => checkpoint.isAnswered).length === state.checkpoints.length;

        // TODO: Gör något med informationen att alla frågor är svarade
        if (isFinished) {
            // TBD: score här är inte uppdaterad än. Så denna sträng bör skapas på något annat vis. Tex. i setScore()
            console.log('Japp nu är det klar och ditt score är', score)
        } else {
            console.log('Next finished', nextCheckpoints.filter(checkpoint => checkpoint.isAnswered).length, ', checkpoints', state.checkpoints.length)
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
        )

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

    return (
        <View style={styles.container}>
            <FlashMessage ref={flashMessageRef} />

            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={currentRegion}
                onPress={handleMapPress}
                onRegionChange={setCurrentRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                toolbarEnabled={false}
            >
                {state.checkpoints.map((checkpoint, index) => (
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
                        showNextCheckpoint={currentCheckpointIndex === index && showNextCheckpoint}
                        onLeave={() => {
                            console.log('onLeave()', 'id:', checkpoint.checkpoint_id)
                            setQuestion(null)
                        }}
                        onEnter={() => console.log('onEnter()', 'id:', checkpoint.checkpoint_id)}

                        // TBD: Bara för testning
                        currentPosition={currenPos}
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
                    onSelect={handleAutoOnSelect}
                    onSubmit={handleAutoOnSubmit}
                />
            ) }

            {question && <AnswerQuestionComponent
                question={question.question}
                onAnswerSelected={(isCorrect) => handleAnswerSelected(isCorrect, question.checkPointId)}
            />}

            <Menu trigger={<Feather name="menu" size={44} color="black" />} bottomRight>
                <MenuTextItem text={showNextCheckpoint ? 'Show Checkpoints Flags only':'Next Checkpoint'} onPress={handleNextCheckpoint} />
                <MenuTextItem text={'Reset the game'} onPress={handleResetGame} />
                <MenuTextItem text={'Restart the game'} onPress={handleRestartGame} />
                <MenuTextItem text={'Remove game'} onPress={handleRemoveGame} />
                <MenuTextItem text={'Qr Code Reader'} onPress={handleQrReader} />
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
})

export default MapsComponent