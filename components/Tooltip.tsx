import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';


type PositionProps = {
    type: 'top' | 'bottom' | 'left' | 'right';
}

enum Position {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left',
}

type AbsolutePosition = {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface IPayload {
    type: Position
    width: number;
    height: number;
}

interface Props {
    children: React.ReactNode;
    content: string
    position?: Position;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


const Tooltip: React.FC<Props> = ({ children, content, position = Position.Top }) => {
    const targetRef = React.useRef<View>(null)
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<AbsolutePosition>({ left: 170, top: 0, width: 0, height: 0 });
    const [dimension, setDimension] = useState({ width: 0, height: 0 });


    const toggleTooltip = () => setTooltipVisible(!tooltipVisible);

    const handlePress = async (event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        console.log('handlePress ->', {pageX, pageY});
        //await delay(500)
        setTooltipPosition({...tooltipPosition, left: pageX, top: pageY});
        //toggleTooltip()
        setTooltipVisible(true);
    }

    useLayoutEffect(() => {
    /*useEffect(() => {*/
        targetRef.current?.measure((x, y, width, height, pageX, pageY) => {
            //setTooltipPosition({...tooltipPosition, width: width, height: height, left: pageX, top: pageY});
            //setTooltipPosition({...tooltipPosition, left: pageX, top: pageY});
            console.log('useLayoutEffect', {x, y, width, height, pageX, pageY});
        })
    }, [tooltipVisible])

    useEffect(() => {
        if (targetRef.current) {
            setTooltipPosition(prevState => prevState)
            console.log('useEffect -> setTooltipPosition')
        }
    }, [tooltipVisible])


    const closeTooltip = () => setTooltipVisible(false);

    const handleLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        console.log('handleLayout', {width, height}, tooltipPosition);
        setDimension({width: width, height: height})
        //setTooltipPosition({...tooltipPosition, width: width, height: height});
        //setTooltipPosition({width: width, height: height, top: tooltipPosition.top, left: tooltipPosition.left});
        /*setTooltipPosition(prevState =>
            ({
                ...prevState,
                width: width, height: height
            })
        )*/
        //setTooltipPosition({...tooltipPosition, left: tooltipPosition.left - width}); detta ger en oändlig loop
    }



    // FIXME: något gör att positionen på tooltipen blir fel vid första tryckningen
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePress}>
                {children}
            </TouchableOpacity>
            <Modal
                transparent
                visible={tooltipVisible}
                onRequestClose={closeTooltip}
            >
                <TouchableOpacity style={styles.modalOverlay} onPress={toggleTooltip}>
                    <View ref={targetRef}
                        style={[styles.tooltipContainer, { position: 'absolute', top: tooltipPosition.top, left: tooltipPosition.left - dimension.width }, styles[position]]}
                        onLayout={handleLayout}
                    >
                        <Text style={styles.tooltipText}>{content}</Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        /*flex: 1,*/
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tooltipContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 5,
        padding: 10,
        maxWidth: '80%',
    },
    tooltipText: {
        color: 'white',
        fontSize: 14,
    },
    top: {
        alignSelf: 'center',
        marginBottom: 100,
    },
    bottom: {
        alignSelf: 'center',
        marginTop: 20,
    },
    left: {
        /*alignSelf: 'flex-start',
        marginRight: 20,*/
    },
    right: {
        alignSelf: 'flex-end',
        marginLeft: 20,
    },
});

export default Tooltip;
export { Position }