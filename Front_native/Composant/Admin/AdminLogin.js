import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES } from '../config/api.config';
import { connectSocket, disconnectSocket, getSocket } from '../../socket/socket';
import { testSocket, offTestSocket } from '../../socket/socketEvents';

// Couleurs
const PRIMARY_COLOR = '#005662';
const SECONDARY_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#E8E8E8';
const TEXT_COLOR = '#333333';
const BORDER_COLOR = '#CCCCCC';

export default function AdminLogin({ navigation }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');

  const updateField = (field, value) => setCredentials({ ...credentials, [field]: value });

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }

    setLoading(true);

    try {
      const response = await fetch(API_ROUTES.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: credentials.email, 
          password: credentials.password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker token et infos utilisateur
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        console.log("✅ Login successful, token saved");

        // Connexion socket
        try {
          setSocketStatus('connecting');
          const socket = await connectSocket();
          setSocketStatus('connected');

          console.log("✅ Socket connected successfully");

          // Écouter les réponses du serveur
          testSocket(null, (response) => {
            console.log("📥 Message reçu depuis le serveur:", response);
            Alert.alert("Socket Test", `Message reçu: ${JSON.stringify(response)}`);
          });

          // Envoyer un message de test
          setTimeout(() => {
            console.log("📤 Sending test message...");
            testSocket({ 
              msg: `Bonjour ${data.user.name} !`,
              timestamp: new Date().toISOString()
            });
          }, 1000);

          // Test automatique après 2 secondes
          setTimeout(() => {
            Alert.alert(
              "Test Socket", 
              "Socket connecté ! Voulez-vous tester l'envoi d'un message ?",
              [
                {
                  text: "Oui",
                  onPress: () => {
                    testSocket({ 
                      action: "manual_test",
                      user: data.user.name,
                      timestamp: new Date().toISOString()
                    });
                    Alert.alert("Envoyé", "Message de test envoyé au serveur");
                  }
                },
                { text: "Non", style: "cancel" }
              ]
            );
          }, 2000);

        } catch (socketError) {
          console.error("❌ Socket connection error:", socketError);
          setSocketStatus('error');
          Alert.alert(
            "Avertissement Socket", 
            "Connexion réussie mais le socket n'a pas pu se connecter. Fonctionnalités temps-réel indisponibles."
          );
        }

        Alert.alert("Succès", `Bienvenue ${data.user.name} !`);
        
        // Attendre un peu pour voir les logs avant de naviguer
        setTimeout(() => {
          navigation.navigate('ajoutMenu');
        }, 500);

      } else {
        Alert.alert("Erreur", data.msg || "Email ou mot de passe incorrect");
      }

    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert("Erreur réseau", "Impossible de se connecter au serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup à la fermeture du composant
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up AdminLogin component...");
      offTestSocket();
      
      // Ne pas déconnecter le socket ici car on navigue vers ajoutMenu
      // La déconnexion se fera lors du logout
    };
  }, []);

  // Indicateur visuel du statut socket (optionnel, pour debug)
  const getSocketStatusColor = () => {
    switch(socketStatus) {
      case 'connected': return SECONDARY_COLOR;
      case 'connecting': return '#FFC107';
      case 'error': return '#D32F2F';
      default: return '#999';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={64} color={PRIMARY_COLOR} />
          <Text style={styles.title}>Espace Administration</Text>
          <Text style={styles.subtitle}>Connectez-vous pour gérer les menus.</Text>
          
          {/* Indicateur de statut Socket (Debug) */}
          {socketStatus !== 'disconnected' && (
            <View style={[styles.socketStatus, { backgroundColor: getSocketStatusColor() }]}>
              <Text style={styles.socketStatusText}>
                Socket: {socketStatus}
              </Text>
            </View>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={24} color={PRIMARY_COLOR} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Adresse Email"
            keyboardType="email-address"
            value={credentials.email}
            onChangeText={text => updateField('email', text)}
            autoCapitalize="none"
            placeholderTextColor="#888"
            editable={!loading}
          />
        </View>

        {/* Mot de passe */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={24} color={PRIMARY_COLOR} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry={!isPasswordVisible}
            value={credentials.password}
            onChangeText={text => updateField('password', text)}
            placeholderTextColor="#888"
            editable={!loading}
          />
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
            style={styles.passwordToggle} 
            disabled={loading}
          >
            <Ionicons 
              name={isPasswordVisible ? "eye-off" : "eye"} 
              size={24} 
              color={PRIMARY_COLOR} 
            />
          </TouchableOpacity>
        </View>

        {/* Bouton connexion */}
        <TouchableOpacity 
          style={styles.loginBtn} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        {/* Lien vers inscription */}
        <View style={styles.registerLinkContainer}>
          <Text style={styles.registerLinkText}>Pas encore de compte ? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('register')} 
            disabled={loading}
          >
            <Text style={styles.registerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton retour */}
        <TouchableOpacity 
          style={styles.returnBtn} 
          onPress={() => navigation.navigate('menuList')} 
          disabled={loading}
        >
          <Text style={styles.returnText}>Retour à l'application</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_COLOR,
    marginTop: 5,
    textAlign: 'center',
  },
  socketStatus: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  socketStatusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 17,
    color: TEXT_COLOR,
  },
  passwordToggle: {
    paddingLeft: 10,
  },
  loginBtn: {
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 25,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5.46,
    elevation: 9,
  },
  loginText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    color: TEXT_COLOR,
    fontSize: 15,
  },
  registerLink: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  returnBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  returnText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 16,
  },
});