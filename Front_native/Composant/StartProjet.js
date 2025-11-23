import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const StartProjet = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StartProjet</Text>

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => navigation.navigate('admin')}
      >
        <Text style={styles.btnText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StartProjet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  btn: {
    backgroundColor: '#005662',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
