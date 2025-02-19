import React, {ComponentRef, Ref, RefObject, useImperativeHandle, useState} from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';

interface IPorps {
    flash: (message: string, timeout?: number) => void;
}

const FlashMessage = React.forwardRef<IPorps>((props, ref: any) => {

    const [isVisible, setIsVisible] = useState(false);
    const [flashMessage, setFlashMessage] = useState('');

    useImperativeHandle(ref, () => ({ flash }))


    const flash = (message: string, timeout: number = 2000) => {
        setIsVisible(true)
        setFlashMessage(message)
        setTimeout(closeFlash, timeout)
    }

    const closeFlash = () => {
        setIsVisible(false)
        setFlashMessage('')
    }

    return (
        <View>
            {
                isVisible ?
                    <View style={styles.scrollboxActionContainer}>
                        <View style={styles.scrollboxActionContainerInner} >
                            <View style={styles.scrollboxHorizontal}>
                                <View style={styles.flashMessage}>
                                    <Text style={styles.flashMessageHeading}>
                                        Alert Notification
                                    </Text>
                                    <Text>
                                        {flashMessage}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    :
                    null
            }
        </View>
    )
})

const styles = StyleSheet.create({
    scrollboxActionContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 10,
        justifyContent: 'center',
        marginTop: Platform.OS === 'ios' ? '2%' : '3%',
        zIndex: 1,
        marginBottom: Platform.OS === 'ios' ? '2%' : '3%',
    },
    scrollboxActionContainerInner: {
        backgroundColor: '#fff'
    },
    scrollboxHorizontal: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 3,
        paddingTop: '10%',
    },
    flashMessage: {
        flex: 1,
        position: 'absolute',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        zIndex: 1,
        backgroundColor: '#edca82',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 3,
        padding: 5,
    },
    flashMessageHeading: {
        fontWeight: 'bold',
        fontSize: 12,
    }
})

export default FlashMessage;