import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {Text, View, StyleSheet, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";
import Spacer from "@/components/Spacer";

type PickerMode = 'date' | 'time';

type StartEndDate = {
    start: Date | null;
    end: Date | null;
}

interface IProps {
    onStartDateChanged: (date: Date | null) => void;
    onEndDateChanged: (date: Date | null) => void;
    initialValue: StartEndDate | null;
}

const SetStartAndEndTime = ({onStartDateChanged, onEndDateChanged, initialValue}: IProps) => {
    const [startDate, setStartDate] = useState<Date | null>( null);
    const [startMode, setStartMode] = useState<PickerMode>('date');
    const [showStartPicker, setShowStartPicker] = useState(false);

    const [endDate, setEndDate] = useState<Date | null>(null);
    const [endMode, setEndMode] = useState<PickerMode>('date');
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        if (initialValue) {
            setStartDate(initialValue.start !== null ? new Date(initialValue.start) : null);
            setEndDate(initialValue.end !== null ? new Date(initialValue.end) : null);
        }
    }, [initialValue]);

    useEffect(() => {
        if (startDate) {
            onStartDateChanged(startDate)
        } else {
            onStartDateChanged(null)
            onEndDateChanged(null)
        }
    }, [startDate]);

    useEffect(() => {
        if (startDate && endDate && endDate > startDate) {
            onEndDateChanged(endDate)
        } else {
            onEndDateChanged(null)
        }
    }, [endDate]);


    const handleOnChangeStart = (event: DateTimePickerEvent, date?: Date) => {
        if (event.type === 'set' && date) {
            const updatedDate = new Date(date);
            if (startMode === 'date') {
                updatedDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                setStartDate(new Date(updatedDate));
                setStartMode('time');
            } else {
                updatedDate.setHours(date.getHours(), date.getMinutes());
                setStartDate(updatedDate);
                setShowStartPicker(false);
                setStartMode('date');
            }
        } else {
            setStartDate(null);
            setShowStartPicker(false);
            setStartMode('date');
        }
    }

    const handleOnChangeEnd = (event: DateTimePickerEvent, date?: Date) => {
        if (event.type === 'set' && date) {
            const updatedDate = new Date(date);
            if (endMode === 'date') {
                updatedDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                setEndDate(new Date(updatedDate));
                setEndMode('time');
            } else {
                updatedDate.setHours(date.getHours(), date.getMinutes());
                setEndDate(updatedDate);
                setShowEndPicker(false);
                setEndMode('date');
            }
        } else {
            setEndDate(null);
            setShowEndPicker(false);
            setEndMode('date');
        }
    }

    const handelSelectEnDate = () => {
        setShowEndPicker(true);
        if (!startDate) {
            setStartDate(new Date())
        }
    }

    const formatEndDate = () => {
        if (startDate && endDate && endDate > startDate) {
            return endDate?.toLocaleString();
        }
        return '';
    }

    return (
        <View style={styles.container}>
            <Text>If no start and end time selected.</Text>
            <Text>There is not time restriction.</Text>
            <Text style={styles.text}>Selected start time: {startDate?.toLocaleString()}</Text>
            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() => setShowStartPicker(true)}
            >
                <Text style={styles.buttonText}>Select start time</Text>
            </TouchableOpacity>
            {showStartPicker && <DateTimePicker
                value={startDate || new Date()}
                mode={startMode}
                onChange={handleOnChangeStart}
                is24Hour={true}
                display={'spinner'}
                positiveButton={{label: `Set start ${startMode}`, textColor: 'green'}}
            />}

            <Spacer size={10} />

            <Text style={styles.text}>Selected End time: {formatEndDate()}</Text>
            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handelSelectEnDate}
            >
                <Text style={styles.buttonText}>Select end time</Text>
            </TouchableOpacity>
            {showEndPicker && <DateTimePicker
                value={endDate || new Date()}
                mode={endMode}
                onChange={handleOnChangeEnd}
                is24Hour={true}
                display={'spinner'}
                positiveButton={{label: `Set end ${startMode}`, textColor: 'green'}}
            />}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        /*flex: 1,*/
    },
    text: {
        fontSize: 18,
        marginBottom: 16,
    },
    buttonContainer: {
        width: 220,
        elevation: 8,
        backgroundColor: "#009688",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12
    },
    buttonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    }
})

export default SetStartAndEndTime;