// app/components/board/choices/choices.component.js
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';

const Choices = ({ onVisibilityChange }) => {

    const socket = useContext(SocketContext);

    const [displayChoices, setDisplayChoices] = useState(false);
    const [canMakeChoice, setCanMakeChoice] = useState(false);
    const [idSelectedChoice, setIdSelectedChoice] = useState(null);
    const [availableChoices, setAvailableChoices] = useState([]);

    useEffect(() => {

        const onChoicesViewState = (data) => {
            setDisplayChoices(data['displayChoices']);
            setCanMakeChoice(data['canMakeChoice']);
            setIdSelectedChoice(data['idSelectedChoice']);
            setAvailableChoices(data['availableChoices']);
        };

        socket.on("game.choices.view-state", onChoicesViewState);

        return () => {
            socket.off("game.choices.view-state", onChoicesViewState);
        };

    }, [socket]);

    useEffect(() => {
        if (onVisibilityChange) {
            onVisibilityChange(true);
        }
    }, [onVisibilityChange]);

    const handleSelectChoice = (choiceId, isSelectable) => {

        if (canMakeChoice && isSelectable) {
            setIdSelectedChoice(choiceId);
            socket.emit("game.choices.selected", { choiceId });
        }

    };

    return (
        <View style={styles.choicesContainer}>
            <Text style={styles.choicesTitle}>Combinaisons</Text>

            <ScrollView
                style={styles.choicesScroll}
                contentContainerStyle={styles.choicesScrollContent}
                showsVerticalScrollIndicator={false}
            >
                {!displayChoices && (
                    <View style={styles.placeholderCard}>
                        <Text style={styles.placeholderText}>Lance les des pour afficher les combinaisons</Text>
                    </View>
                )}

                {displayChoices &&
                    availableChoices.map((choice) => {
                        const isChoiceDisabled = !canMakeChoice || !choice.isSelectable;

                        return (
                        <TouchableOpacity
                            key={choice.id}
                            style={[
                                styles.choiceButton,
                                idSelectedChoice === choice.id && styles.selectedChoice,
                                isChoiceDisabled && styles.disabledChoice,
                                !choice.isSelectable && styles.unavailableChoice,
                            ]}
                            onPress={() => handleSelectChoice(choice.id, choice.isSelectable)}
                            disabled={isChoiceDisabled}
                        >
                            <Text
                                style={[
                                    styles.choiceText,
                                    idSelectedChoice === choice.id && styles.selectedChoiceText,
                                ]}
                            >
                                {choice.value}
                            </Text>
                        </TouchableOpacity>
                        );
                    })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // LAYOUT: Zone des choix
    choicesContainer: {
        flex: 1,
        alignSelf: "stretch",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(212, 175, 55, 0.4)",
        backgroundColor: "rgba(26, 61, 34, 0.92)",
        paddingHorizontal: 8,
        paddingVertical: 10,
    },
    choicesTitle: {
        color: "#FFE082",
        fontSize: 13,
        fontWeight: "900",
        marginBottom: 8,
        textAlign: "center",
    },
    choicesScroll: {
        flex: 1,
    },
    choicesScrollContent: {
        gap: 8,
    },
    placeholderCard: {
        backgroundColor: "rgba(255, 247, 230, 0.12)",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(212, 175, 55, 0.3)",
        minHeight: 46,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    placeholderText: {
        color: "#FFF7E6",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
        opacity: 0.85,
    },
    // LAYOUT: Boutons de combinaison
    choiceButton: {
        backgroundColor: "#FFF7E6",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(212, 175, 55, 0.4)",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: 46,
        paddingHorizontal: 8,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedChoice: {
        backgroundColor: "#7A1111",
    },
    // LAYOUT: Typographie des choix
    choiceText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#3D1F14",
        textAlign: "center",
    },
    disabledChoice: {
        opacity: 0.45,
    },
    unavailableChoice: {
        backgroundColor: '#7E8A80',
    },
    // 🎨 Contraste du choix sélectionné
    selectedChoiceText: {
        color: '#FFF7E6',
    },
});

export default Choices;

Choices.propTypes = {
    onVisibilityChange: PropTypes.func,
};

Choices.defaultProps = {
    onVisibilityChange: null,
};
