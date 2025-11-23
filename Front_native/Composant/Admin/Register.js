import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES } from '../config/api.config';

// Couleurs (Variables)
const PRIMARY_COLOR = '#005662';
const SECONDARY_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#E8E8E8';
const TEXT_COLOR = '#333333';
const BORDER_COLOR = '#CCCCCC';

export default function Register({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    role: 'client' // Valeur par défaut
  });
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const updateField = (field, value) => setFormData({ ...formData, [field]: value });

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    // Validation des champs
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
    }

    if (!validateEmail(formData.email)) {
      return Alert.alert("Erreur", "Veuillez entrer une adresse email valide");
    }

    if (formData.password.length < 6) {
      return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
    }

    if (formData.password !== formData.confirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
    }

    setLoading(true);

    try {
      const response = await fetch(API_ROUTES.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar || '',
          role: formData.role, // Envoyer le rôle sélectionné
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "Succès", 
          `Compte créé avec succès en tant que ${formData.role === 'admin' ? 'Administrateur' : 'Client'} ! Vous pouvez maintenant vous connecter.`,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate('admin')
            }
          ]
        );
      } else {
        Alert.alert("Erreur", data.msg || "Impossible de créer le compte");
      }
    } catch (error) {
      console.error("Register error:", error);
      Alert.alert("Erreur réseau", "Impossible de se connecter au serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
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
          <Ionicons name="person-add" size={64} color={PRIMARY_COLOR} />
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Inscrivez-vous pour accéder à l'administration</Text>
        </View>

        {/* Nom complet */}
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={24} color={PRIMARY_COLOR} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nom complet *"
            value={formData.name}
            onChangeText={text => updateField('name', text)}
            autoCapitalize="words"
            placeholderTextColor="#888"
            editable={!loading}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={24} color={PRIMARY_COLOR} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Adresse Email *"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={text => updateField('email', text)}
            autoCapitalize="none"
            placeholderTextColor="#888"
            editable={!loading}
          />
        </View>

        {/* Avatar (optionnel) */}
        <View style={styles.inputContainer}>
          <Ionicons name="image" size={24} color={PRIMARY_COLOR} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="URL Avatar (optionnel)"
            value={formData.avatar}
            onChangeText={text => updateField('avatar', text)}
            autoCapitalize="none"
            placeholderTextColor="#888"
            editable={!loading}
          />
        </View>

        {/* Sélection du rôle */}
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Type de compte *</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity 
              style={[
                styles.roleButton, 
                formData.role === 'client' && styles.roleButtonActive
              ]}
              onPress={() => updateField('role', 'client')}
              disabled={loading}
            >
              <Ionicons 
                name="person" 
                size={24} 
                color={formData.role === 'client' ? '#FFF' : PRIMARY_COLOR} 
              />
              <Text style={[
                styles.roleButtonText,
                formData.role === 'client' && styles.roleButtonTextActive
              ]}>
                Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.roleButton, 
                formData.role === 'admin' && styles.roleButtonActive
              ]}
              onPress={() => updateField('role', 'admin')}
              disabled={loading}
            >
              <Ionicons 
                name="shield-checkmark" 
                size={24} 
                color={formData.role === 'admin' ? '#FFF' : PRIMARY_COLOR} 
              />
              <Text style={[
                styles.roleButtonText,
                formData.role === 'admin' && styles.roleButtonTextActive
              ]}>
                Administrateur
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mot de passe */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={24} color={PRIMARY_COLOR} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (min. 6 caractères) *"
            secureTextEntry={!isPasswordVisible}
            value={formData.password}
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

        {/* Confirmation mot de passe */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={24} color={PRIMARY_COLOR} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe *"
            secureTextEntry={!isConfirmPasswordVisible}
            value={formData.confirmPassword}
            onChangeText={text => updateField('confirmPassword', text)}
            placeholderTextColor="#888"
            editable={!loading}
          />
          <TouchableOpacity 
            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            style={styles.passwordToggle}
            disabled={loading}
          >
            <Ionicons 
              name={isConfirmPasswordVisible ? "eye-off" : "eye"} 
              size={24} 
              color={PRIMARY_COLOR} 
            />
          </TouchableOpacity>
        </View>

        {/* Bouton inscription */}
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.registerText}>Créer mon compte</Text>
          )}
        </TouchableOpacity>
        
        {/* Lien vers connexion */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>Vous avez déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('admin')} disabled={loading}>
            <Text style={styles.loginLink}>Se connecter</Text>
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
    marginBottom: 40,
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
    color: TEXT_COLOR 
  },
  passwordToggle: {
    paddingLeft: 10,
  },
  roleContainer: {
    width: '100%',
    marginBottom: 15,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  registerBtn: {
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
  registerText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: TEXT_COLOR,
    fontSize: 15,
  },
  loginLink: {
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
    fontSize: 16 
  },
});