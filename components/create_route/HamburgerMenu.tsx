import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface Props {
    onHelp: () => void;
    onGenerateRandomCheckpoints: () => void;
}

const HamburgerMenu = ({/*visible, onClose, */onHelp, onGenerateRandomCheckpoints}: Props) => {
    const [menuVisible, setMenuVisible] = useState(false);

    const handleRandomCheckpoints = () => {
        toggleMenu();
        onGenerateRandomCheckpoints()
    }

    const handleHelp = () => {
        toggleMenu();
        onHelp()
    }

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    }

    return (
        <>
            <TouchableOpacity style={styles.hamburgerButton} onPress={toggleMenu}>
                <Text style={styles.hamburgerButtonText}>≡</Text>
            </TouchableOpacity>
            <Modal visible={menuVisible} transparent={true} animationType="fade">
                <TouchableOpacity style={styles.modalBackground} onPress={toggleMenu}>
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
    </>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    hamburgerButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 30,
        elevation: 5, // för att ge en liten skugga (Android)
        shadowColor: '#000', // för iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    hamburgerButtonText: {
        fontSize: 24,
        textAlign: 'center',
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