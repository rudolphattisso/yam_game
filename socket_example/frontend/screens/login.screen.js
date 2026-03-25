import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text, Pressable, TextInput } from "react-native";

export default function LoginScreen({ navigation }) {
    const [formMode, setFormMode] = useState('login');
    const [identifier, setIdentifier] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isRegisterMode = formMode === 'register';
    const title = isRegisterMode ? 'Creer un compte' : 'Connexion';
    const actionLabel = isRegisterMode ? 'Creer mon compte' : 'Se connecter';

    const handleSubmit = () => {
        navigation.navigate('HomeScreen', {
            userMode: 'connected',
            authMode: formMode,
            displayName: isRegisterMode ? (username || email || 'Utilisateur') : (identifier || 'Utilisateur'),
        });
    };

    const handleSwitchMode = (nextMode) => {
        setFormMode(nextMode);
        setIdentifier('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
                {isRegisterMode
                    ? 'Renseigne tes informations pour creer un compte.'
                    : 'Connecte-toi si tu as deja un compte.'}
            </Text>

            <View style={styles.switchRow}>
                <Pressable
                    style={[styles.switchButton, !isRegisterMode && styles.switchButtonActive]}
                    onPress={() => handleSwitchMode('login')}
                >
                    <Text style={[styles.switchButtonText, !isRegisterMode && styles.switchButtonTextActive]}>
                        Connexion
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.switchButton, isRegisterMode && styles.switchButtonActive]}
                    onPress={() => handleSwitchMode('register')}
                >
                    <Text style={[styles.switchButtonText, isRegisterMode && styles.switchButtonTextActive]}>
                        Inscription
                    </Text>
                </Pressable>
            </View>

            {!isRegisterMode && (
                <TextInput
                    style={styles.input}
                    placeholder="Email ou pseudo"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                />
            )}

            {isRegisterMode && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Pseudo"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </>
            )}

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {isRegisterMode && (
                <TextInput
                    style={styles.input}
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            )}

            <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{actionLabel}</Text>
            </Pressable>

            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Retour</Text>
            </Pressable>
        </View>
    );
}

LoginScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#475569",
        textAlign: "center",
        marginBottom: 24,
    },
    switchRow: {
        flexDirection: "row",
        backgroundColor: "#e2e8f0",
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    switchButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
    },
    switchButtonActive: {
        backgroundColor: "#ffffff",
    },
    switchButtonText: {
        color: "#334155",
        fontWeight: "600",
    },
    switchButtonTextActive: {
        color: "#0f172a",
    },
    input: {
        width: "100%",
        maxWidth: 320,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
    },
    submitButton: {
        width: "100%",
        maxWidth: 320,
        backgroundColor: "#0284c7",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 8,
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
    backButton: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    backButtonText: {
        color: "#475569",
        fontSize: 15,
        fontWeight: "600",
    },
});