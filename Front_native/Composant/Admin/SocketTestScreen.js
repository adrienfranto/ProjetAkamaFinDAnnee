// Composant/Admin/SocketTestScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connectSocket, disconnectSocket, getSocket } from '../../socket/socket';
import { testSocket, offTestSocket, onUserStatusChanged, offUserStatusChanged } from '../../socket/socketEvents';

const PRIMARY_COLOR = '#005662';
const SUCCESS_COLOR = '#4CAF50';
const ERROR_COLOR = '#D32F2F';

export default function SocketTestScreen({ navigation }) {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [socketId, setSocketId] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ message, type, timestamp }, ...prev].slice(0, 50)); // Garder les 50 derniers
  };

  const handleConnect = async () => {
    try {
      addLog('🔄 Tentative de connexion...', 'info');
      const socket = await connectSocket();
      setIsConnected(true);
      setSocketId(socket.id);
      addLog(`✅ Socket connecté: ${socket.id}`, 'success');

      // Écouter les événements de test
      testSocket(null, (data) => {
        addLog(`📥 Message reçu: ${JSON.stringify(data)}`, 'success');
      });

      // Écouter les changements de statut
      onUserStatusChanged((data) => {
        addLog(`👤 Statut changé: ${JSON.stringify(data)}`, 'info');
      });

    } catch (error) {
      addLog(`❌ Erreur connexion: ${error.message}`, 'error');
      Alert.alert('Erreur', error.message);
    }
  };

  const handleDisconnect = () => {
    disconnectSocket();
    setIsConnected(false);
    setSocketId(null);
    offTestSocket();
    offUserStatusChanged();
    addLog('🔌 Socket déconnecté', 'info');
  };

  const handleSendTest = () => {
    if (!isConnected) {
      return Alert.alert('Erreur', 'Socket non connecté');
    }

    const testData = {
      msg: 'Test message',
      timestamp: new Date().toISOString(),
      random: Math.random()
    };

    addLog(`📤 Envoi: ${JSON.stringify(testData)}`, 'info');
    testSocket(testData);
  };

  const handleCheckStatus = () => {
    const socket = getSocket();
    if (socket) {
      addLog(`📊 Socket ID: ${socket.id}, Connected: ${socket.connected}`, 'info');
      Alert.alert('Statut Socket', `ID: ${socket.id}\nConnecté: ${socket.connected ? 'Oui' : 'Non'}`);
    } else {
      addLog('❌ Aucun socket disponible', 'error');
      Alert.alert('Statut', 'Socket non initialisé');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🧹 Logs effacés', 'info');
  };

  useEffect(() => {
    addLog('🚀 Écran de test Socket chargé', 'info');

    return () => {
      addLog('👋 Fermeture de l\'écran de test', 'info');
    };
  }, []);

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return SUCCESS_COLOR;
      case 'error': return ERROR_COLOR;
      default: return '#333';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Socket.IO</Text>
      </View>

      <View style={styles.statusBar}>
        <View style={[styles.statusIndicator, { backgroundColor: isConnected ? SUCCESS_COLOR : ERROR_COLOR }]} />
        <Text style={styles.statusText}>
          {isConnected ? `Connecté (${socketId})` : 'Déconnecté'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: isConnected ? ERROR_COLOR : SUCCESS_COLOR }]}
          onPress={isConnected ? handleDisconnect : handleConnect}
        >
          <Ionicons name={isConnected ? "close-circle" : "checkmark-circle"} size={20} color="white" />
          <Text style={styles.btnText}>{isConnected ? 'Déconnecter' : 'Connecter'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: PRIMARY_COLOR }]}
          onPress={handleSendTest}
          disabled={!isConnected}
        >
          <Ionicons name="send" size={20} color="white" />
          <Text style={styles.btnText}>Envoyer Test</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: '#FF9800' }]}
          onPress={handleCheckStatus}
        >
          <Ionicons name="information-circle" size={20} color="white" />
          <Text style={styles.btnText}>Vérifier Statut</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: '#9E9E9E' }]}
          onPress={clearLogs}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.btnText}>Effacer Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>📋 Logs ({logs.length})</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.length === 0 ? (
            <Text style={styles.emptyLogs}>Aucun log pour le moment...</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logTime}>{log.timestamp}</Text>
                <Text style={[styles.logMessage, { color: getLogColor(log.type) }]}>
                  {log.message}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: '48%',
    justifyContent: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logsContainer: {
    flex: 1,
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logsScroll: {
    flex: 1,
  },
  emptyLogs: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
  logItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logTime: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 13,
    fontWeight: '500',
  },
});