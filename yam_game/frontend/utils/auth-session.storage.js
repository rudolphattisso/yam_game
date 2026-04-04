import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_SESSION_KEY = 'yam_master_auth_session';

const parseSession = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (_error) {
    return null;
  }

  return null;
};

export const loadAuthSession = async () => {
  const rawValue = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  return parseSession(rawValue);
};

export const saveAuthSession = async (session) => {
  if (!session || typeof session !== 'object') {
    return;
  }

  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const clearAuthSession = async () => {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
};

export const buildClientSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
