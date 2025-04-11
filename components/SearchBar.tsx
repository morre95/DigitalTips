import React, {useEffect, useRef} from "react";
import { StyleSheet, TextInput, View, Text, Keyboard, TouchableOpacity, InputModeOptions } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";


interface IProps {
    inFokus: boolean;
    searchPhrase: string;
    onSearchPhraseChange: (searchPhrase: string) => void;
    onFokusChange: (inFokus: boolean) => void;
    onSubmit?: (text: string) => void;
    placeholder?: string;
    inputMode?: InputModeOptions;
}

const SearchBar = ({inFokus, searchPhrase, onSearchPhraseChange, onFokusChange, onSubmit, placeholder, inputMode}: IProps) => {
    const textInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (inFokus && textInputRef.current) {
            textInputRef.current.focus();
        }
    }, [inFokus]);

    const handleOnSubmit = () => {
        if (onSubmit) onSubmit(searchPhrase)
    }

    return (
        <View style={styles.container}>
            <View
                style={
                    inFokus
                        ? styles.searchBar__clicked
                        : styles.searchBar__unClicked
                }
            >
                <Feather
                    name="search"
                    size={24}
                    color="black"
                    onPress={() => {
                        textInputRef?.current?.focus();
                    }}
                />
                <TextInput
                    ref={textInputRef}
                    style={styles.input}
                    placeholder={placeholder ? placeholder : "Search"}
                    value={searchPhrase}
                    onChangeText={onSearchPhraseChange}
                    onFocus={() => {
                        onFokusChange(true);
                    }}
                    onBlur={() => {
                        onFokusChange(false);
                    }}
                    onSubmitEditing={handleOnSubmit}
                    inputMode={inputMode ? inputMode : 'text'}
                />
                {inFokus && (
                    <Entypo
                        name="cross"
                        size={24}
                        color="black"
                        style={styles.deleteIcon}
                        onPress={() => {
                        onSearchPhraseChange("")
                    }}/>
                )}
            </View>
            {inFokus && (
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        onFokusChange(false);
                    }}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
export default SearchBar;

// styles
const styles = StyleSheet.create({
    container: {
        margin: 15,
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        width: "95%",
        position: 'relative',
    },
    searchBar__unClicked: {
        padding: 10,
        flexDirection: "row",
        width: "95%",
        backgroundColor: "#d9dbda",
        borderRadius: 15,
        alignItems: "center",
    },
    searchBar__clicked: {
        padding: 10,
        flexDirection: "row",
        width: "80%",
        backgroundColor: "#d9dbda",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "space-evenly",
    },
    input: {
        fontSize: 20,
        marginLeft: 8,
        paddingRight: 20,
        width: "90%",
    },
    deleteIcon: {
        position: 'absolute',
        top: '50%',
        right: 0,
    },
    cancelText: {
        fontSize: 20,
        fontWeight: "400",
        marginLeft: 10,
        color: "#3c8aea",
    }
});