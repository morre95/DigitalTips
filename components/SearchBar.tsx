import React, {useRef} from "react";
import { StyleSheet, TextInput, View, Text, Keyboard, TouchableOpacity } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";


interface IProps {
    clicked: boolean;
    searchPhrase: string;
    onSearchPhraseChange: (searchPhrase: string) => void;
    onClick: (clicked: boolean) => void;
}

const SearchBar = ({clicked, searchPhrase, onSearchPhraseChange, onClick}: IProps) => {
    const textInputRef = useRef<TextInput>(null);
    return (
        <View style={styles.container}>
            <View
                style={
                    clicked
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
                    placeholder="Search"
                    value={searchPhrase}
                    onChangeText={onSearchPhraseChange}
                    onFocus={() => {
                        onClick(true);
                    }}
                    onBlur={() => {
                        onClick(false);
                    }}
                />
                {clicked && (
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
            {clicked && (
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        onClick(false);
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