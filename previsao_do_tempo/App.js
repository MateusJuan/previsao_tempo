import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import SvgUri from 'expo-svg-uri';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada');
        Alert.alert('Permissão negada', 'É necessário permitir o uso da localização para exibir o clima.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      fetch(`https://api.hgbrasil.com/weather?key=8d5f2c8d&lat=${latitude}&lon=${longitude}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.results) {
            setWeather(data.results);
          } else {
            setErrorMsg('Erro ao carregar clima');
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar dados:', error);
          setErrorMsg('Erro de conexão');
        });
    })();
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
            {weather.condition_slug && (
              <SvgUri
                width="100"
                height="100"
                source={{
                  uri: `https://assets.hgbrasil.com/weather/icons/conditions/${weather.condition_slug}.svg`,
                }}
              />
            )}
            <Text style={styles.text}>{weather.description}</Text>
            <Text style={styles.temperaturaAtual}>{weather.temp}°C</Text>

            {weather.forecast && weather.forecast[0] && (
              <Text style={[styles.text, { fontSize: 20, marginTop: 5 }]}>
                Máx: {weather.forecast[0].max}°C / Mín: {weather.forecast[0].min}°C
              </Text>
            )}

            <View style={styles.ventosContainer}>
              <Text style={styles.ventosText}>Umidade: {weather.humidity}%</Text>
              <Text style={styles.ventosText}>Vento: {weather.wind_speedy}</Text>
              <Text style={styles.ventosText}>🌧️ Chuva: {weather.rain} mm</Text>
            </View>
          </View>

          <View style={styles.hoje}>
            <View style={styles.hojeTituloContainer}>
              <Text style={styles.text}>Hoje:</Text>
            </View>

            <View style={styles.sunContainer}>
              <MaterialIcons name="wb-sunny" size={28} color="#FFD700" />
              <Text style={styles.sunText}>Nascer do sol: {weather.sunrise}</Text>
            </View>

            <View style={styles.sunContainer}>
              <MaterialIcons name="nights-stay" size={28} color="#87CEEB" />
              <Text style={styles.sunText}>Pôr do sol: {weather.sunset}</Text>
            </View>
          </View>

          <View style={styles.previsaoContainer}>
            {weather.forecast &&
              weather.forecast.slice(1, 7).map((dia, index) => (
                <View key={index} style={styles.previsaoDia}>
                  <Text style={styles.diaTexto}>
                    {dia.weekday} {dia.date}
                  </Text>
                  <SvgUri
                    width="50"
                    height="50"
                    source={{
                      uri: `https://assets.hgbrasil.com/weather/icons/conditions/${dia.condition}.svg`,
                    }}
                  />
                  <Text style={styles.tempMaxMin}>
                    {dia.max}° / {dia.min}°
                  </Text>
                </View>
              ))}
          </View>
        </>
      ) : (
        <Text style={styles.text}>{errorMsg || 'Carregando previsão do tempo...'}</Text>
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
  text: {
    color: '#fff',
    fontSize: 25,
  },
  temperaturaAtual: {
    fontSize: 65,
    color: '#fff',
    fontWeight: 'bold',
  },
  ventosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  ventosText: {
    color: '#ddd',
    fontSize: 19,
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
  hoje: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 15,
    width: '90%',
  },
  hojeTituloContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  sunContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sunText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
  },
  previsaoContainer: {
    marginTop: 30,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  previsaoDia: {
    backgroundColor: 'rgba(0,0,0, 0.3)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '30%',
    marginBottom: 15,
  },
  diaTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  tempMaxMin: {
    color: '#fff',
    fontSize: 16,
  },
});
