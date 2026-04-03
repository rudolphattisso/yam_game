import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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

const buildResultLabel = (game) => {
  if (game?.player1_is_winner === true) {
    return 'Victoire joueur 1';
  }

  if (game?.player2_is_winner === true) {
    return 'Victoire joueur 2';
  }

  return 'Egalite';
};

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
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

      const response = await fetch(`${API_BASE_URL}/api/games/recent?limit=30`);
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
  }, []);

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

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemTopRow}>
        <Text style={styles.itemMode}>{String(item?.mode || 'online').toUpperCase()}</Text>
        <Text style={styles.itemDate}>{formatDateTime(item?.ended_at)}</Text>
      </View>

      <Text style={styles.itemResult}>{buildResultLabel(item)}</Text>

      <View style={styles.itemPlayersRow}>
        <Text style={styles.itemPlayerLabel}>J1: {item?.player1_label || 'player1'} ({item?.player1_score ?? 0})</Text>
        <Text style={styles.itemPlayerLabel}>J2: {item?.player2_label || 'player2'} ({item?.player2_score ?? 0})</Text>
      </View>

      <Text style={styles.itemReason}>Fin: {item?.win_reason || 'normal'}</Text>
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
      </View>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => String(item?.id || index)}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchHistory({ refreshing: true })}
              tintColor="#A78BFA"
            />
          }
        />
      )}

      {!isLoading && errorMessage && (
        <Pressable style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.8 }]} onPress={() => fetchHistory()}>
          <Text style={styles.retryButtonText}>Reessayer</Text>
        </Pressable>
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
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#DDD6FE',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
    gap: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMode: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  itemDate: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  itemResult: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  itemPlayersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  itemPlayerLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  itemReason: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#C4B5FD',
    textAlign: 'center',
    marginTop: 28,
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    alignSelf: 'center',
    marginTop: 8,
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
