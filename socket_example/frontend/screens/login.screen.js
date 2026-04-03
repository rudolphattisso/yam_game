import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { buildClientSessionId, saveAuthSession } from '../utils/auth-session.storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
    || process.env.EXPO_PUBLIC_SOCKET_URL
    || (Platform.OS === 'web' ? 'http://localhost:3000' : 'http://172.20.10.3:3000');

export default function LoginScreen({ navigation, route }) {
    const initialModeFromRoute = route?.params?.initialMode === 'register' ? 'register' : 'login';
    const [formMode, setFormMode] = useState(initialModeFromRoute);
    const [identifier, setIdentifier] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const resetFormFields = () => {
        setIdentifier('');
    const handleGuestMode = () => {
        navigation.navigate('HomeScreen', {
            userMode: 'guest',
            clientSessionId: route?.params?.clientSessionId || buildClientSessionId(),
        });
    };
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFocusedInput(null);
        setFormError('');
    };

    const isRegisterMode = formMode === 'register';
    const title = isRegisterMode ? '✨ Créer un compte' : '👾 Connexion';
    const actionLabel = isRegisterMode ? 'CRÉER MON COMPTE' : 'SE CONNECTER';

    useEffect(() => {
        const nextMode = route?.params?.initialMode === 'register' ? 'register' : 'login';
        setFormMode(nextMode);
    }, [route?.params?.initialMode]);

    const handleSubmit = async () => {
        setFormError('');

        if (isRegisterMode) {
            if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
                setFormError('Tous les champs sont obligatoires');
                return;
            }

            if (password !== confirmPassword) {
                setFormError('Les mots de passe ne correspondent pas');
                return;
            }
        } else if (!identifier.trim() || !password.trim()) {
            setFormError('Identifiant et mot de passe obligatoires');
            return;
        }

        setIsSubmitting(true);

        try {
            const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
            const payload = isRegisterMode
                ? {
                    username: username.trim(),
                    email: email.trim(),
                    password,
                }
                : {
                    identifier: identifier.trim(),
                    password,
                };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const detail = data?.details?.[0]?.message;
                setFormError(detail || data?.message || 'Erreur de connexion au serveur');
                return;
            }

            if (isRegisterMode) {
                resetFormFields();
            }

            const clientSessionId = route?.params?.clientSessionId || buildClientSessionId();
            const sessionPayload = {
                userMode: 'connected',
                authMode: formMode,
                isAuthenticated: true,
                displayName: data?.user?.username || data?.user?.email || 'Utilisateur',
                user: data?.user,
                accessToken: data?.accessToken,
                refreshToken: data?.refreshToken,
                clientSessionId,
            };

            await saveAuthSession(sessionPayload);

            navigation.navigate('HomeScreen', sessionPayload);
        } catch (_error) {
            setFormError(`Impossible de joindre l API (${API_BASE_URL})`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSwitchMode = (nextMode) => {
        setFormMode(nextMode);
        resetFormFields();
    };

    const handleGuestMode = () => {
        navigation.navigate('HomeScreen', {
            userMode: 'guest',
            clientSessionId: route?.params?.clientSessionId || buildClientSessionId(),
        });
    };

    return (
        <View style={styles.container}>

            {/* ── Particules décoratives ── */}
            <View style={styles.particle1} />
            <View style={styles.particle2} />
            <View style={styles.particle3} />
            <View style={styles.particle4} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>🎲 YAM MASTER</Text>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>
                            {isRegisterMode
                                ? 'Rejoins la compétition dès maintenant !'
                                : 'Content de te revoir, champion !'}
                        </Text>
                    </View>

                    {/* ── Carte principale ── */}
                    <View style={styles.card}>

                        {/* Toggle Connexion / Inscription */}
                        <View style={styles.switchRow}>
                            <Pressable
                                style={[styles.switchButton, !isRegisterMode && styles.switchButtonActive]}
                                onPress={() => handleSwitchMode('login')}
                            >
                                {!isRegisterMode ? (
                                    <LinearGradient
                                        colors={['#FF00FF', '#8A2BE2']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.switchGradient}
                                    >
                                        <Text style={styles.switchButtonTextActive}>Connexion</Text>
                                    </LinearGradient>
                                ) : (
                                    <Text style={styles.switchButtonText}>Connexion</Text>
                                )}
                            </Pressable>

                            <Pressable
                                style={[styles.switchButton, isRegisterMode && styles.switchButtonActive]}
                                onPress={() => handleSwitchMode('register')}
                            >
                                {isRegisterMode ? (
                                    <LinearGradient
                                        colors={['#FF00FF', '#8A2BE2']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.switchGradient}
                                    >
                                        <Text style={styles.switchButtonTextActive}>Inscription</Text>
                                    </LinearGradient>
                                ) : (
                                    <Text style={styles.switchButtonText}>Inscription</Text>
                                )}
                            </Pressable>
                        </View>

                        {/* ── Champs du formulaire ── */}
                        {!isRegisterMode && (
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'identifier' && styles.inputWrapperFocused
                            ]}>
                                <Text style={styles.inputIcon}>👤</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email ou pseudo"
                                    placeholderTextColor="#6B7280"
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                    onFocus={() => setFocusedInput('identifier')}
                                    onBlur={() => setFocusedInput(null)}
                                    autoCapitalize="none"
                                />
                            </View>
                        )}

                        {isRegisterMode && (
                            <>
                                <View style={[
                                    styles.inputWrapper,
                                    focusedInput === 'username' && styles.inputWrapperFocused
                                ]}>
                                    <Text style={styles.inputIcon}>🎮</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Pseudo"
                                        placeholderTextColor="#6B7280"
                                        value={username}
                                        onChangeText={setUsername}
                                        onFocus={() => setFocusedInput('username')}
                                        onBlur={() => setFocusedInput(null)}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={[
                                    styles.inputWrapper,
                                    focusedInput === 'email' && styles.inputWrapperFocused
                                ]}>
                                    <Text style={styles.inputIcon}>📧</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor="#6B7280"
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </>
                        )}

                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'password' && styles.inputWrapperFocused
                        ]}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                placeholderTextColor="#6B7280"
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                                secureTextEntry
                            />
                        </View>

                        {isRegisterMode && (
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'confirm' && styles.inputWrapperFocused
                            ]}>
                                <Text style={styles.inputIcon}>🔐</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirmer le mot de passe"
                                    placeholderTextColor="#6B7280"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onFocus={() => setFocusedInput('confirm')}
                                    onBlur={() => setFocusedInput(null)}
                                    secureTextEntry
                                />
                            </View>
                        )}

                        {/* ── Bouton principal ── */}
                        <Pressable
                            style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={isSubmitting ? ['#6B7280', '#4B5563'] : ['#FF00FF', '#8A2BE2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitButtonText}>{isSubmitting ? 'CHARGEMENT...' : actionLabel}</Text>
                            </LinearGradient>
                        </Pressable>

                        {!!formError && (
                            <Text style={styles.formErrorText}>{formError}</Text>
                        )}

                        {/* ── Bouton retour ── */}
                        <Pressable
                            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>← Retour à l'accueil</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.guestLinkWrapper, pressed && { opacity: 0.7 }]}
                            onPress={handleGuestMode}
                        >
                            <Text style={styles.guestLinkText}>
                                Continuer sans compte ? <Text style={styles.guestLinkTextStrong}>Mode invite</Text>
                            </Text>
                        </Pressable>

                    </View>
                    {/* fin card */}

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

LoginScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        goBack: PropTypes.func.isRequired,
    }).isRequired,
    route: PropTypes.shape({
        params: PropTypes.shape({
            initialMode: PropTypes.oneOf(['login', 'register']),
        }),
    }),
};

LoginScreen.defaultProps = {
    route: undefined,
};

const styles = StyleSheet.create({

    // ─── Fond global ────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: '#0A0A1A',
    },

    // ─── Particules ─────────────────────────────────
    particle1: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(138, 43, 226, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(138, 43, 226, 0.4)',
    },
    particle2: {
        position: 'absolute',
        top: 140,
        right: 30,
        width: 45,
        height: 45,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 0, 255, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255, 0, 255, 0.4)',
    },
    particle3: {
        position: 'absolute',
        bottom: 120,
        left: 40,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(138, 43, 226, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(138, 43, 226, 0.5)',
    },
    particle4: {
        position: 'absolute',
        bottom: 80,
        right: 50,
        width: 55,
        height: 55,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 255, 0.3)',
    },

    // ─── KeyboardAvoidingView ────────────────────────
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },

    // ─── Header ─────────────────────────────────────
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    logo: {
        fontSize: 18,
        fontWeight: '900',
        color: '#B0B0FF',
        letterSpacing: 3,
        marginBottom: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#FFFFFF',
        textShadowColor: 'rgba(255, 0, 255, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#8B8BC0',
        textAlign: 'center',
        letterSpacing: 0.3,
    },

    // ─── Carte ──────────────────────────────────────
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(20, 20, 40, 0.85)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(138, 43, 226, 0.3)',
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15,
    },

    // ─── Toggle ─────────────────────────────────────
    switchRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(138, 43, 226, 0.2)',
    },
    switchButton: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    switchButtonActive: {
        shadowColor: '#FF00FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    switchGradient: {
        width: '100%',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    switchButtonText: {
        color: '#6B7280',
        fontWeight: '600',
        fontSize: 14,
        paddingVertical: 10,
    },
    switchButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },

    // ─── Inputs ─────────────────────────────────────
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(138, 43, 226, 0.2)',
        borderRadius: 14,
        paddingHorizontal: 14,
        marginBottom: 12,
        minHeight: 52,
        width: '100%',
    },
    inputWrapperFocused: {
        borderColor: '#FF00FF',
        backgroundColor: 'rgba(255, 0, 255, 0.06)',
        shadowColor: '#FF00FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    inputIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
        paddingVertical: 14,
    },

    // ─── Bouton principal ────────────────────────────
    submitButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#FF00FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    submitButtonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    formErrorText: {
        color: '#FCA5A5',
        fontWeight: '700',
        marginTop: 10,
        textAlign: 'center',
    },

    // ─── Bouton retour ───────────────────────────────
    backButton: {
        marginTop: 18,
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    backButtonText: {
        color: '#8B8BC0',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    guestLinkWrapper: {
        marginTop: 12,
        alignItems: 'center',
    },
    guestLinkText: {
        color: '#CBB4FF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    guestLinkTextStrong: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
});
