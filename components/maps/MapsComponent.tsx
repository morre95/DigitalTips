import React, {useState, useRef, ComponentRef} from 'react';
import {StyleSheet, View, Vibration} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Region} from "react-native-maps";
import CheckPoint from "./CheckPoint";
import {Checkpoint, Question} from "@/interfaces/common";
import {useMapDispatch, useMapsState} from "./MapsContext";
import FlashMessage from "@/components/FlashMessage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Autocomplete from "./Autocomplete";
import {getCheckpoints, SearchResponse} from "@/hooks/api/Get";
import AnswerQuestionComponent from "@/components/maps/AnswerQuestionComponent";


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

interface Props {}

const MapsComponent = ({}: Props) => {
    const state = useMapsState();
    const dispatch = useMapDispatch();
    const flashMessageRef = useRef<ComponentRef<typeof FlashMessage>>(null);
    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
    const [question, setQuestion] = useState<QuestionType | null>(null);
    const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(0);
    const [score, setScore] = useState(0);
    const [showSearchButton, setShowSearchButton] = useState(true);

    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        console.log(coordinate);

        setShowSearchButton(true)
    }

    const handleSearchPress = () => {
        setShowSearchButton(!showSearchButton);
    }

    const handelAutoOnSelect = async (item: SearchResponse) => {
        setShowSearchButton(true)
        type Markers = {
            checkpoints: Checkpoint[];
        }
        const markers = await getCheckpoints<Markers>(item.routeId)

        const checkpoints = markers.checkpoints.map(checkpoint => {
            checkpoint.question.answers = [...checkpoint.question.answers].sort(() => Math.random() - 0.5);
            return checkpoint
        })

        dispatch(() => checkpoints);
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

        dispatch(() => nextCheckpoints)
    };

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
                        onLeave={() => {
                            console.log('onLeave()', 'id:', checkpoint.checkpoint_id)
                            setQuestion(null)
                        }}
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

            {question && <AnswerQuestionComponent
                question={question.question}
                onAnswerSelected={(isCorrect) => handleAnswerSelected(isCorrect, question.checkPointId)}
            />}
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