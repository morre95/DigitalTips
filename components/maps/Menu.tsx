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
import {Link, Href} from "expo-router";

const { height: layoutHeight} = Dimensions.get("window");

interface IMenuProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    topLeft?: boolean;
    topRight?: boolean;
    bottomLeft?: boolean;
    bottomRight?: boolean;
}

type PressableType = {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}

const Menu = ({ trigger, children, topRight, topLeft, bottomRight, bottomLeft } : IMenuProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const triggerWrapperRef = useRef<View>(null);
    const pressablePositionRef = useRef<PressableType>({top: 0, left: 0});

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
            pressablePositionRef.current = {top: 10, left: 10};
        } else if (topRight) {
            pressablePositionRef.current = {top: 10, right: 10};
        } else if (bottomLeft) {
            pressablePositionRef.current = {left: 10, bottom: 10};
        } else if (bottomRight) {
            pressablePositionRef.current = {right: 10, bottom: 10};
        } else {
            //pressablePositionRef.current = {top: 10, left: 10};
        }
    }, [topRight, topLeft, bottomRight, bottomLeft]);

    return (
        <>
            <View
                style={[{position: 'absolute', zIndex:1}, pressablePositionRef.current]}
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



interface IMenuTextItemProps {
    text: string;
    onPress: () => void;
    closeModal?: () => void;
}
export const MenuTextItem = ({ text, onPress, closeModal }: IMenuTextItemProps) => {
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

interface IMenuChildrenItemProps {
    onPress: () => void;
    closeModal?: () => void;
    children: React.ReactNode;
}

export const MenuClickableItem = ({ onPress, closeModal, children }: IMenuChildrenItemProps) => {
    const handleOnPress = () => {
        onPress();
        if (closeModal) closeModal();
    };

    return (
        <TouchableOpacity onPress={handleOnPress}>
            {children}
        </TouchableOpacity>
    );
}

interface IMenuItemLinkProps {
    href: Href;
    text: string;
    closeModal?: () => void;
    children?: React.ReactNode;
}

export const MenuItemLink = ({href, text, closeModal, children}: IMenuItemLinkProps) => {
    const handleOnPress = () => {
        if (closeModal) closeModal();
    };
    return (
        <Link
            onPress={handleOnPress}
            style={styles.touchableButton}
            href={href}>
            <Text style={styles.touchableText}>{text}</Text>
            {children}
        </Link>
    )
}

const styles = StyleSheet.create({
    modalWrapper: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    activeSection: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
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

        /*Shadow*/
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 2, width: 1 }, // IOS
        shadowOpacity: 2, // IOS
        shadowRadius: 2, //IOS
        elevation: 4, // Android
    },
    touchableText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
});


export default Menu;