import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    View,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    Text,
    Modal,
    Dimensions,
} from "react-native";

const { width: layoutWidth, height: layoutHeight } = Dimensions.get("window");

interface IMenuProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    topRight?: boolean;
    topLeft?: boolean;
    bottomRight?: boolean;
    bottomLeft?: boolean;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}

const Menu = ({ trigger, children, topRight, topLeft, bottomRight, bottomLeft } : IMenuProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const triggerWrapperRef = useRef<View>(null);
    const [pressablePosition, setPressablePosition] = useState<{top: number, left: number}>({top: 0, left: 0});

    // states to hold the trigger and menu dimensions
    const [triggerDimensions, setTriggerDimensions] = useState({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    });

    const [modalDimensions, setModalDimensions] = useState({
        width: 0,
        height: 0,
    });

    const calculateTriggerDimensions = () => {
        if (triggerWrapperRef && triggerWrapperRef.current) {
            triggerWrapperRef.current.measureInWindow((x, y, width, height) => {
                setTriggerDimensions({
                    top: Math.max(y, 0),
                    left: x,
                    width,
                    height,
                });
            });
        }
    };

    const calculateWrapperDimensions = (event: any) => {
        const {width, height} = event.nativeEvent.layout;
        setModalDimensions({width, height});
    }

    const menuPositionStyles = useMemo(() => {
        let top : number;

        const initialTriggerTop = triggerDimensions.top + triggerDimensions.height;

        top = initialTriggerTop + modalDimensions.height > layoutHeight ?
            initialTriggerTop - triggerDimensions.height - modalDimensions.height :
            initialTriggerTop;

        return { top: top, left: 0 };
    }, [modalDimensions, triggerDimensions]);


    const closeModal = () => {
        setModalVisible(false);
    };


    useEffect(() => {
        if (topLeft) {
            setPressablePosition({top: 10, left: 10})
        } else if (topRight) {
            setPressablePosition({top: 10, left: layoutWidth - (10 + triggerDimensions.width)})
        } else if (bottomLeft) {
            setPressablePosition({top: layoutHeight - (130 + triggerDimensions.height), left: 10})
        } else if (bottomRight) {
            setPressablePosition({top: layoutHeight - (130 + triggerDimensions.height), left: layoutWidth - (10 + triggerDimensions.width)})
        }
    }, [topRight, topLeft, bottomRight, bottomLeft, triggerDimensions.width, triggerDimensions.height]);

    return (
        <>
            <View
                style={[{position: 'absolute', zIndex:1}, pressablePosition]}
                onLayout={calculateTriggerDimensions}
            >
                <Pressable
                    onPress={() => {
                        setModalVisible(true);
                    }}
                    ref={triggerWrapperRef}
                >
                    {trigger}
                </Pressable>
            </View>
            <Modal visible={modalVisible} transparent={true} animationType="fade" onLayout={calculateWrapperDimensions}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={closeModal}
                    style={styles.modalWrapper}
                >
                    <View
                        style={[styles.activeSection, menuPositionStyles]}
                        collapsable={false}
                        onLayout={calculateWrapperDimensions}
                    >
                        {
                            React.Children.map(children, child => {
                                if (React.isValidElement(child)) {
                                    return React.cloneElement(child as React.ReactElement<any>, {closeModal})
                                }
                            })
                        }
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};



interface IMenuItemProps {
    text: string;
    onPress: () => void;
    closeModal?: () => void;
}
export const MenuItem = ({ text, onPress, closeModal }: IMenuItemProps) => {
    const handleOnPress = () => {
        onPress();
        if (closeModal) closeModal();
    };

    return (
        <TouchableOpacity style={styles.touchableButton} onPress={handleOnPress}>
            <Text style={styles.touchableText}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    modalWrapper: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        /*flex: 1,
        justifyContent: 'center',
        alignItems: 'center',*/
    },
    activeSection: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    touchableButton: {
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: '#0569FF',
        borderColor: '#0569FF',
    },
    touchableText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
    },
});


export default Menu;