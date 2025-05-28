import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch('https://api.hgbrasil.com/weather?key=9d2e3c60&city_name=Recife,PE')
      .then((response) => response.json())
      .then((data) => {
        setWeather(data.results);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
      });
  }, []);

  return (
    <LinearGradient colors={['#0d1f6b', '#1f3e9f']} style={styles.container}>
      {weather ? (
        <>
          <View style={styles.cidadeTopo}>
            <MaterialIcons name="location-on" size={24} color="white" />
            <Text style={[styles.text, { marginLeft: 5 }]}>{weather.city}</Text>
          </View>
          <View style={styles.temperatura_hoje}>
            <Image
              source={{
                uri: `https://assets.hgbrasil.com/weather/icons/conditions/${weather.condition_slug}.png`,
              }}
              style={styles.image}
            />
            <Text style={styles.text}>{weather.description}</Text>

            {/* Temperatura atual em destaque */}
            <Text style={styles.temperaturaAtual}>{weather.temp}°C</Text>

            {/* Exemplo mostrando umidade e vento */}
              <View style={styles.minMaxContainer}>
                <Text style={styles.minMaxText}>Umidade: {weather.humidity}%</Text>
                <Text style={styles.minMaxText}>Vento: {weather.wind_speedy}</Text>
                <Text style={styles.minMaxText}>🌧️ Chuva: {weather.rain} mm</Text>
              </View>
          </View>
        </>
      ) : (
        <Text style={styles.text}>Carregando...</Text>
      )}
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperatura_hoje: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  text: {
    color: '#fff',
    fontSize: 25,
  },
  temperaturaAtual: {
    fontSize: 65,
    color: '#fff',
    fontWeight: 'bold',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  minMaxText: {
    color: '#ddd',
    fontSize: 16,
    marginHorizontal: 5,
  },
  cidadeTopo: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
});
