import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadAuthSession } from '../utils/auth-session.storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  || process.env.EXPO_PUBLIC_SOCKET_URL
  || 'http://localhost:3000';

const formatDateTime = (value) => {
  if (!value) {
    return 'Date inconnue';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date inconnue';
  }

  return parsed.toLocaleString('fr-FR');
};

const normalizeLabel = (value, fallback) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
};

const getModeLabel = (value) => {
  if (value === 'bot') {
    return 'Vs Bot';
  }

  return 'En ligne';
};

const getWinnerLabel = (game) => {
  const player1 = normalizeLabel(game?.player1_label, 'Joueur 1');
  const player2 = normalizeLabel(game?.player2_label, 'Joueur 2');

  if (game?.player1_is_winner === true) {
    return player1;
  }

  if (game?.player2_is_winner === true) {
    return player2;
  }

  return 'Egalite';
};

const getReasonLabel = (value) => {
  if (value === 'five-aligned') {
    return '5 pions alignes';
  }

  if (value === 'no-pawns-left') {
    return 'Plus de pions disponibles';
  }

  return normalizeLabel(value, 'Fin normale');
};

export default function HistoryScreen({ route }) {
  const [items, setItems] = useState([]);
  const [modeFilter, setModeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchHistory = useCallback(async ({ refreshing = false } = {}) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage('');

      const storedSession = await loadAuthSession();
      const token = route?.params?.accessToken || storedSession?.accessToken;

      if (!token) {
        setErrorMessage('Vous devez etre connecte pour consulter votre historique.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/games/recent?limit=30`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.message || 'Impossible de recuperer l historique.');
        return;
      }

      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (_error) {
      setErrorMessage('Le serveur est indisponible pour le moment.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [route?.params?.accessToken]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const emptyText = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }

    return 'Aucune partie enregistree pour le moment.';
  }, [errorMessage]);

  const filteredItems = useMemo(() => {
    if (modeFilter === 'all') {
      return items;
    }

    return items.filter((item) => item?.mode === modeFilter);
  }, [items, modeFilter]);

  const renderItem = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemTopRow}>
        <View style={styles.itemHeadingLeft}>
          <Text style={styles.itemIndex}>Partie #{index + 1}</Text>
          <View style={[
            styles.modeBadge,
            item?.mode === 'bot' ? styles.modeBadgeBot : styles.modeBadgeOnline,
          ]}>
            <Text style={styles.modeBadgeText}>{getModeLabel(item?.mode)}</Text>
          </View>
        </View>
        <Text style={styles.itemDate}>Le {formatDateTime(item?.ended_at)}</Text>
      </View>

      <Text style={styles.itemResult}>Gagnant: {getWinnerLabel(item)}</Text>

      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Type</Text>
          <Text style={styles.infoValue}>{getModeLabel(item?.mode)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Date</Text>
          <Text style={styles.infoValue}>{formatDateTime(item?.ended_at)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Joueur 1</Text>
          <Text style={styles.infoValue}>
            {normalizeLabel(item?.player1_label, 'Joueur 1')} ({item?.player1_score ?? 0} pts)
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Joueur 2</Text>
          <Text style={styles.infoValue}>
            {normalizeLabel(item?.player2_label, 'Joueur 2')} ({item?.player2_score ?? 0} pts)
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Cause de fin</Text>
          <Text style={styles.infoValue}>{getReasonLabel(item?.win_reason)}</Text>
        </View>
      </View>

      <Text style={styles.itemReason}>Score final: {item?.player1_score ?? 0} - {item?.player2_score ?? 0}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1027', '#141B44', '#0C1130']}
        style={styles.background}
      />

      <View style={styles.headerCard}>
        <Text style={styles.title}>Historique des parties</Text>
        <Text style={styles.subtitle}>Consultez vos dernieres parties terminees</Text>
        {!isLoading && (
          <Text style={styles.countText}>Parties affichees: {filteredItems.length}</Text>
        )}

        <View style={styles.filterRow}>
          <Pressable
            style={({ pressed }) => [
              styles.filterChip,
              modeFilter === 'all' && styles.filterChipActive,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => setModeFilter('all')}
          >
            <Text style={[styles.filterChipText, modeFilter === 'all' && styles.filterChipTextActive]}>Tous</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.filterChip,
              modeFilter === 'online' && styles.filterChipActive,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => setModeFilter('online')}
          >
            <Text style={[styles.filterChipText, modeFilter === 'online' && styles.filterChipTextActive]}>En ligne</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.filterChip,
              modeFilter === 'bot' && styles.filterChipActive,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => setModeFilter('bot')}
          >
            <Text style={[styles.filterChipText, modeFilter === 'bot' && styles.filterChipTextActive]}>Vs Bot</Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            data={filteredItems}
            style={styles.list}
            keyExtractor={(item, index) => String(item?.id || index)}
            contentContainerStyle={[
              styles.listContent,
              filteredItems.length === 0 && styles.listContentEmpty,
            ]}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
            ListFooterComponent={
              errorMessage ? (
                <Pressable
                  style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.8 }]}
                  onPress={() => fetchHistory()}
                >
                  <Text style={styles.retryButtonText}>Reessayer</Text>
                </Pressable>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchHistory({ refreshing: true })}
                tintColor="#A78BFA"
              />
            }
            showsVerticalScrollIndicator
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1027',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  headerCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.45)',
    marginBottom: 14,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  countText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  filterRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.45)',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    borderColor: 'rgba(56, 189, 248, 0.85)',
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
  },
  filterChipText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#E0F2FE',
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#DDD6FE',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  listWrapper: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  itemSeparator: {
    height: 10,
  },
  itemCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.45)',
    padding: 12,
    gap: 6,
  },
  itemTopRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  itemHeadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemIndex: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: '#FDE68A',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  modeBadge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  modeBadgeOnline: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.7)',
  },
  modeBadgeBot: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.7)',
  },
  modeBadgeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  itemDate: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
  },
  itemResult: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  infoBlock: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.45)',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  infoRow: {
    gap: 2,
  },
  infoKey: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'left',
  },
  itemReason: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: '#C4B5FD',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  retryButton: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#4338CA',
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
