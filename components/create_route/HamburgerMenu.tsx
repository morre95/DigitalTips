import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onHelp: () => void;
    onGenerateRandomCheckpoints: () => void;
}

const HamburgerMenu = ({visible, onClose, onHelp, onGenerateRandomCheckpoints}: Props) => {
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        setMenuVisible(visible);
    }, [visible]);

    const closeMenu = () => {
        onClose()
    };

    const handleRandomCheckpoints = () => {
        closeMenu()
        onGenerateRandomCheckpoints()
    }

    const handleHelp = () => {
        closeMenu()
        onHelp()
    }

    return (
        <Modal visible={menuVisible} transparent={true} animationType="fade">
            <TouchableOpacity style={styles.modalBackground} onPress={closeMenu}>
                <View style={styles.menu}>
                    <TouchableOpacity onPress={handleHelp}>
                        <Text style={styles.menuItem}>Help</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRandomCheckpoints}>
                        <Text style={styles.menuItem}>Generate Random Checkpoints</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    menu: {
        backgroundColor: '#fff',
        padding: 20,
    },
    menuItem: {
        fontSize: 24,
        paddingVertical: 10,
    },
});

export default HamburgerMenu;