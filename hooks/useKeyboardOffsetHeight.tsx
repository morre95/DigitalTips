import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export default function useKeyboardOffsetHeight() {
    const [keyboardOffsetHeight, setKeyboardOffsetHeight] = useState(0);
    const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);

    useEffect(() => {
        const showListener = Keyboard.addListener('keyboardWillShow', (e) => {
            setKeyboardOffsetHeight(e.endCoordinates.height);
        });
        const hideListener = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardOffsetHeight(0);
        });

        const androidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardOffsetHeight(e.endCoordinates.height);
        });
        const androidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardOffsetHeight(0);
        });

        return () => {
            showListener.remove();
            hideListener.remove();
            androidShowListener.remove();
            androidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardIsOpen(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardIsOpen(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);


    return [keyboardOffsetHeight, keyboardIsOpen];
}