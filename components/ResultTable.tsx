import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface IResultTableProps {
    columns: string[];
    rows: string[][];
    // Index of a row to visually highlight (e.g. the current player on a leaderboard).
    highlightRowIndex?: number;
}

// Shared simple table used by the personal results modal (ShowResult) and the
// route leaderboard on the Result screen, so both stay visually consistent.
const ResultTable = ({columns, rows, highlightRowIndex}: IResultTableProps) => {
    return (
        <View style={styles.gridContainer}>
            <View style={styles.headerStyle}>
                {columns.map((data, index) => (
                    <View key={index.toString()} style={styles.headerCellStyle}>
                        <Text style={styles.headerTextStyle}>{data}</Text>
                    </View>
                ))}
            </View>
            {rows.map((row, rowIndex) => (
                <View
                    key={rowIndex.toString()}
                    style={[styles.rowStyle, rowIndex === highlightRowIndex && styles.highlightRow]}
                >
                    {row.map((data, cellIndex) => (
                        <View key={cellIndex.toString()} style={styles.cellStyle}>
                            <Text>{data}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    headerStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
    },
    headerCellStyle: {
        flex: 1,
        marginHorizontal: 10,
    },
    headerTextStyle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    rowStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    highlightRow: {
        backgroundColor: '#e3f0ff',
    },
    cellStyle: {
        flex: 1,
        margin: 10,
    },
});

export default ResultTable;
